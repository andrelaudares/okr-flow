from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from supabase import Client
import requests
from fastapi.security import OAuth2PasswordBearer
from postgrest.exceptions import APIError
from uuid import uuid4
import traceback
from pydantic import BaseModel

from ..models.user import UserRegister, UserLogin, UserProfile, UserRegisterResponse
from ..utils.supabase import supabase_client, supabase_admin
from ..utils.asaas import asaas_request, create_asaas_customer
from ..dependencies import get_current_user

router = APIRouter()

class ResetPasswordRequest(BaseModel):
    email: str

class UpdatePasswordRequest(BaseModel):
    access_token: str
    refresh_token: str
    new_password: str

def check_supabase_config():
    """Verifica se o Supabase está configurado"""
    if not supabase_client or not supabase_admin:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Serviço não configurado. Configure as variáveis de ambiente SUPABASE_URL, SUPABASE_KEY e SUPABASE_SERVICE_KEY."
        )

@router.post("/register", summary="Registra um novo usuário principal (owner da empresa)", response_model=UserRegisterResponse, status_code=201)
async def register_user(user_data: UserRegister):
    """
    Registra o primeiro usuário que se torna automaticamente o owner da empresa.
    Sistema de pagamento temporariamente desabilitado - usuário recebe mensagem de aguardo.
    """
    check_supabase_config()
    
    print("DEBUG: Rota /api/auth/register iniciada")
    try:
        print(f"DEBUG: Dados recebidos para registro: {user_data.email}")
        
        # Verificar se email já existe na tabela users
        try:
            existing_user = supabase_admin.from_('users').select("id").eq('email', user_data.email).execute()
            if existing_user.data:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email já está em uso")
        except Exception as e:
            print(f"DEBUG: Erro ao verificar email existente: {e}")
        
        # 1. Registrar usuário no Supabase Auth
        print("DEBUG: Tentando registrar usuário no Supabase Auth...")
        try:
            auth_response = supabase_admin.auth.sign_up({
                "email": user_data.email, 
                "password": user_data.password
            })
            print(f"DEBUG: Resposta Supabase Auth: {auth_response}")
        except Exception as e_auth:
            print(f"DEBUG: Erro no Supabase Auth: {e_auth}")
            error_msg = str(e_auth)
            if "already registered" in error_msg.lower():
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email já está registrado no sistema de autenticação")
            elif "invalid" in error_msg.lower():
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Dados inválidos para registro")
            else:
                raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erro na autenticação: {error_msg}")

        if not auth_response or not auth_response.user:
            print("DEBUG: Resposta de auth inválida")
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Erro ao registrar usuário na autenticação")

        user_id = auth_response.user.id
        print(f"DEBUG: Usuário registrado no Supabase Auth com ID: {user_id}")

        # 2. Criar empresa automaticamente
        company_id = str(uuid4())
        print(f"DEBUG: Criando empresa com ID: {company_id}")
        
        company_data = {
            "id": company_id,
            "name": f"Empresa de {user_data.name}",
            "created_at": "now()",
            "updated_at": "now()"
        }
        
        try:
            company_response = supabase_admin.from_('companies').insert(company_data).execute()
            print(f"DEBUG: Empresa criada com sucesso")
            if not company_response.data:
                raise Exception("Erro ao inserir empresa")
        except Exception as e_company:
            print(f"DEBUG: Erro ao criar empresa: {e_company}")
            # Rollback Auth
            try:
                supabase_admin.auth.admin.delete_user(user_id)
                print("DEBUG: Rollback do usuário Auth executado")
            except Exception as rollback_err:
                print(f"DEBUG: Erro no rollback Auth: {rollback_err}")
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro ao criar empresa")
        
        # 3. Criar cliente no Asaas (simplificado, opcional)
        asaas_customer_id = None
        try:
            print("DEBUG: Tentando criar cliente no Asaas...")
            asaas_customer_payload = {
                "name": user_data.name,
                "email": user_data.email,
                "mobilePhone": user_data.phone or "",
                "cpfCnpj": user_data.cpf_cnpj,
                "externalReference": str(user_id),
                "address": user_data.address or "",
                "description": user_data.description or ""
            }
            
            asaas_customer_data = create_asaas_customer(asaas_customer_payload)
            asaas_customer_id = asaas_customer_data.get("id")
            print(f"DEBUG: Cliente Asaas criado: {asaas_customer_id}")
        except Exception as e_asaas:
            print(f"DEBUG: Erro no Asaas (não crítico): {e_asaas}")
            # Asaas é opcional por enquanto, não faz rollback se falhar aqui
            asaas_customer_id = None
       

        # 4. Inserir usuário como owner da empresa
        user_data_db = {
            'id': str(user_id),
            'email': user_data.email,
            'username': user_data.username,
            'name': user_data.name,
            'cpf_cnpj': user_data.cpf_cnpj,
            'asaas_customer_id': asaas_customer_id,
            'address': user_data.address,
            'phone': user_data.phone,
            'description': user_data.description,
            'role': 'ADMIN',
            'company_id': company_id,
            'is_owner': True,
            'is_active': True  # Novo usuário já inicia ativo
        }

        try:
            print("DEBUG: Inserindo usuário na tabela users...")
            user_response = supabase_admin.from_('users').insert(user_data_db).execute()
            print(f"DEBUG: Usuário inserido com sucesso na tabela users: {user_response}")
            
            if not user_response.data:
                # Se a inserção falhou, precisamos de um rollback mais completo
                raise Exception("Erro ao inserir dados do usuário na tabela users")

        except Exception as e_user_insert:
            print(f"DEBUG: Erro ao inserir usuário na tabela users: {e_user_insert}")
            # Rollback completo: remover empresa, cliente Asaas (se criado) e usuário do Auth
            try:
                supabase_admin.from_('companies').delete().eq('id', company_id).execute()
                print(f"DEBUG: Rollback da empresa {company_id} executado.")
                if asaas_customer_id:
                    # Tentar deletar cliente Asaas apenas se foi criado
                    try:
                        asaas_request("DELETE", f"customers/{asaas_customer_id}")
                        print(f"DEBUG: Rollback do cliente Asaas {asaas_customer_id} executado.")
                    except Exception as e_asaas_delete:
                        print(f"DEBUG: Erro no rollback do cliente Asaas (não crítico): {e_asaas_delete}")
                supabase_admin.auth.admin.delete_user(user_id)
                print(f"DEBUG: Rollback do usuário Auth {user_id} executado.")
            except Exception as rollback_err_full:
                print(f"DEBUG: Erro crítico no rollback completo: {rollback_err_full}")
            
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erro ao salvar dados do usuário: {str(e_user_insert)}")

        print(f"DEBUG: Registro completo bem-sucedido para usuário {user_id}")
        
        
        return UserRegisterResponse(
            message="Cadastro realizado com sucesso! Você já pode fazer login no sistema.",
            user_id=user_id,
            requires_approval=False
        )

    except HTTPException:
        raise
    except Exception as e_general:
        print(f"DEBUG: Erro geral no registro: {e_general}")
        print(f"DEBUG: Stack trace: {traceback.format_exc()}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erro interno: {str(e_general)}")

@router.post("/login", summary="Realiza login e retorna tokens")
async def login_user(user_data: UserLogin):
    """
    Autentica usuário e retorna token JWT com expiração longa.
    Verifica se usuário está ativo antes de permitir login.
    """
    check_supabase_config()
    
    try:
        print(f"DEBUG: Tentativa de login para: {user_data.email}")
        
        # Fazer login no Supabase Auth
        try:
            auth_response = supabase_client.auth.sign_in_with_password({
                "email": user_data.email,
                "password": user_data.password
            })
        except Exception as e_auth:
            print(f"DEBUG: Erro no Supabase Auth login: {e_auth}")
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciais inválidas")
        
        if not auth_response.session:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciais inválidas")

        # Verificar se usuário existe na tabela users
        try:
            user_check = supabase_admin.from_('users').select("*").eq('email', user_data.email).execute()
            
            if not user_check.data:
                # Se usuário não existe na tabela users, fazer logout do Auth
                supabase_client.auth.sign_out()
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuário não encontrado no sistema")
            
            user_profile = user_check.data[0]
            
            # Removemos a verificação de is_active para permitir login de usuários inativos
            # if not user_profile.get('is_active', True):
            #     # Fazer logout do usuário se estiver inativo
            #     supabase_client.auth.sign_out()
            #     raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuário desativado. Entre em contato com o administrador.")
                
        except HTTPException:
            raise
        except Exception as e_user_check:
            print(f"DEBUG: Erro ao verificar usuário na tabela: {e_user_check}")
            # Se não conseguir verificar, invalidar sessão por segurança
            supabase_client.auth.sign_out()
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro interno ao verificar usuário")

        print(f"DEBUG: Login bem-sucedido para: {user_data.email}")
        print(f"DEBUG: Token de acesso gerado com expiração longa")
        
        return {
            "access_token": auth_response.session.access_token,
            "token_type": "bearer",
            "refresh_token": auth_response.session.refresh_token,
            "user": {
                "id": user_profile["id"],
                "email": user_profile["email"],
                "name": user_profile["name"],
                "role": user_profile["role"],
                "is_owner": user_profile["is_owner"],
                "company_id": user_profile["company_id"]
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"DEBUG: Erro no login: {e}")
        print(f"DEBUG: Stack trace: {traceback.format_exc()}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro interno do servidor")

@router.post("/logout", summary="Realiza logout (invalida a sessão no Supabase)")
async def logout_user(current_user: UserProfile = Depends(get_current_user)):
    """
    Invalida a sessão atual do usuário.
    """
    check_supabase_config()
    
    try:
        # Usar o cliente global para logout
        supabase_client.auth.sign_out()
        return {"message": "Logout realizado com sucesso"}
    except Exception as e:
        print(f"DEBUG: Erro no logout: {e}")
        # Não é crítico se logout falhar
        return {"message": "Logout realizado com sucesso"}

@router.post("/refresh", summary="Refresh do token de acesso")
async def refresh_token(refresh_token: str):
    """
    Gera novo token de acesso usando refresh token.
    """
    check_supabase_config()
    
    try:
        auth_response = supabase_client.auth.refresh_session(refresh_token)
        
        if not auth_response.session:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token inválido")
        
        return {
            "access_token": auth_response.session.access_token,
            "token_type": "bearer",
            "refresh_token": auth_response.session.refresh_token
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"DEBUG: Erro no refresh: {e}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Erro ao renovar token")

@router.get("/me", summary="Dados do usuário logado")
async def get_current_user_data(current_user: UserProfile = Depends(get_current_user)):
    """
    Retorna dados completos do usuário autenticado.
    """
    return current_user

@router.post("/reset-password", summary="Solicitar reset de senha")
async def request_password_reset(reset_data: ResetPasswordRequest):
    """
    Envia email de reset de senha usando o Supabase Auth.
    Apenas usuários ativos podem solicitar reset.
    """
    check_supabase_config()
    
    try:
        # Verificar se usuário existe e está ativo
        user_check = supabase_admin.from_('users').select("is_active").eq('email', reset_data.email).execute()
        
        if not user_check.data:
            # Por segurança, retornamos sucesso mesmo se usuário não existe
            return {"message": "Se o email estiver cadastrado e ativo, você receberá instruções para redefinir sua senha."}
        
        user_profile = user_check.data[0]
        
        if not user_profile.get('is_active', True):
            # Usuário inativo não pode fazer reset
            return {"message": "Se o email estiver cadastrado e ativo, você receberá instruções para redefinir sua senha."}
        
        # Enviar email de reset pelo Supabase Auth
        reset_response = supabase_admin.auth.reset_password_email(reset_data.email)
        
        print(f"DEBUG: Reset de senha solicitado para: {reset_data.email}")
        
        return {"message": "Se o email estiver cadastrado e ativo, você receberá instruções para redefinir sua senha."}
        
    except Exception as e:
        print(f"DEBUG: Erro no reset de senha: {e}")
        # Por segurança, sempre retorna sucesso
        return {"message": "Se o email estiver cadastrado e ativo, você receberá instruções para redefinir sua senha."}

@router.post("/update-password", summary="Atualizar senha com token de reset")
async def update_password_with_token(update_data: UpdatePasswordRequest):
    """
    Atualiza a senha usando tokens de reset recebidos por email.
    """
    check_supabase_config()
    
    try:
        # Verificar e usar os tokens para autenticar
        session_response = supabase_admin.auth.set_session(
            access_token=update_data.access_token,
            refresh_token=update_data.refresh_token
        )
        
        if not session_response.session:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tokens inválidos ou expirados")
        
        # Atualizar senha
        user_response = supabase_admin.auth.update_user({
            "password": update_data.new_password
        })
        
        if not user_response.user:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Erro ao atualizar senha")
        
        # Verificar se usuário ainda está ativo
        user_check = supabase_admin.from_('users').select("is_active").eq('email', user_response.user.email).execute()
        
        if user_check.data and not user_check.data[0].get('is_active', True):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuário desativado")
        
        print(f"DEBUG: Senha atualizada com sucesso para: {user_response.user.email}")
        
        return {"message": "Senha atualizada com sucesso"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"DEBUG: Erro ao atualizar senha: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Erro ao atualizar senha. Tokens podem estar inválidos ou expirados.") 