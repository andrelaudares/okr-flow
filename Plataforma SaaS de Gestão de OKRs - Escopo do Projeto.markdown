# Plataforma SaaS de Gestão de OKRs - Escopo do Projeto

## 1. Visão e Objetivos do Projeto

A Plataforma SaaS de Gestão de OKRs tem como objetivo capacitar organizações a definir, acompanhar e alcançar metas estratégicas usando a metodologia de Objetivos e Resultados-Chave (OKR). Essa ferramenta baseada na web fornecerá interfaces intuitivas para definir objetivos, monitorar resultados-chave, visualizar o progresso por meio de painéis e gerar relatórios de desempenho. Ela é voltada para CEOs, gerentes, líderes de equipe, RH estratégico, PMOs e consultorias empresariais, promovendo alinhamento e transparência em todos os níveis.

**Objetivos:**

- Simplificar a criação e gestão de OKRs.
- Fornecer insights em tempo real sobre progresso e desempenho.
- Melhorar a colaboração por meio de recursos de acompanhamento e comunicação.
- Fornecer dados acionáveis por meio de relatórios e painéis.

## 2. Funcionalidades e Características

### 2.1 Cadastro e Gestão de OKRs

- **Objetivos:** Criar, editar e excluir metas qualitativas curtas.
- **Resultados-Chave (KRs):** Adicionar metas quantitativas aos objetivos, com valores atuais e metas.
- **Ciclos:** Classificar OKRs por períodos de tempo (por exemplo, trimestral, anual).
- **Agrupamento:** Organizar OKRs por empresa, equipe ou indivíduo.

### 2.2 Painel com Cartões de Indicadores

- **Cartões Visuais:** Mostrar nome do objetivo, porcentagem de progresso, status (Em andamento, Concluído, Atrasado) e um gráfico simples de evolução.
- **Filtros:** Filtrar por responsável, departamento, status ou período.

### 2.3 Atualização e Acompanhamento

- **Check-ins:** Registrar atualizações periódicas para KRs.
- **Comentários:** Adicionar notas por responsáveis ou gerentes.
- **Histórico:** Acompanhar o progresso ao longo do tempo.
- **Cálculo de Progresso:** Calcular automaticamente o progresso do objetivo como a média de seus KRs.

### 2.4 Relatórios e Painéis

- **Relatórios:** Gerar resumos por objetivo, equipe ou colaborador.
- **Exportação:** Salvar relatórios como PDF ou Excel.
- **Painéis:** Exibir evolução temporal, taxas de conclusão, mapas de calor de engajamento e rankings de equipes.

### 2.5 Gestão de Usuários e Permissões

- **Perfis:** Suportar funções de Administrador, Gerente e Colaborador.
- **Permissões:** Definir acesso para visualização, edição e criação de conteúdo.
- **Associações:** Vincular usuários a equipes e objetivos.

### 2.6 Regras de Negócio

- OKRs são concluídos apenas quando todos os KRs atingem 100%.
- O progresso do objetivo é a média aritmética do progresso dos KRs.
- KRs suportam valores percentuais, numéricos ou binários, com metas-alvo, valores atuais e unidades.
- A edição é restrita a ciclos ativos (admins isentos).
- Notificações via e-mail/Slack para check-ins pendentes ou fins de ciclo.

## 3. Casos de Uso Detalhados

### 3.1.0 Autenticação, Autorização de Usuários, e Pagamento

| Campo | Descrição |
| --- | --- |
| **Atores** | Todos os usuários (Administradores, Gerentes, Colaboradores) |
| **Descrição** | Registrar, e Escolher um assinatura. |
| **Pré-condições** | \- O usuário deve criar uma conta no banco de dados, e no gateway de pagamento valido. <br>- Deve executar o pagamento da assinatura de forma correta. |
| **Fluxo Principal** | 1\. O usuário acessa a página de registro. <br>2. Insere suas credenciais. <br>3. O sistema valida as credenciais. <br>4. O usuário é redirecionado para a pagina de pagamento, onde ele já terá escolhido o plano desejado. <br>5. Validamos o pagamento, e por fim, estará permitido para o login. |
| **Fluxos Alternativos** | \- Credenciais incorretas: exibe mensagem de erro. <br>- Esqueceu a senha: solicita redefinição. |
| **Pós-condições** | \- Usuário deve escolher o plano na Landing Page ou após o registro. <br>- Deve-se colocar dados validos de pagamento. |

### 3.1.1 Autenticação e Autorização de Usuários

| Campo | Descrição |
| --- | --- |
| **Atores** | Todos os usuários (Administradores, Gerentes, Colaboradores) |
| **Descrição** | Registrar, fazer login e gerenciar perfis; administradores atribuem funções e permissões. |
| **Pré-condições** | \- O usuário deve ter uma conta válida para fazer login. <br>- Administradores devem ter permissões para gerenciar funções e permissões. |
| **Fluxo Principal** | 1\. O usuário acessa a página de login. <br>2. Insere suas credenciais. <br>3. O sistema valida as credenciais. <br>4. O usuário é redirecionado para o painel principal. <br>5. Administradores acessam a gestão de usuários para atribuir funções e permissões. |
| **Fluxos Alternativos** | \- Credenciais incorretas: exibe mensagem de erro. <br>- Esqueceu a senha: solicita redefinição. |
| **Pós-condições** | \- Usuário autenticado com acesso conforme perfil. <br>- Administradores gerenciam funções e permissões. |

### 3.2 Gestão de OKRs

| Campo | Descrição |
| --- | --- |
| **Atores** | Gerentes, Colaboradores (com permissões) |
| **Descrição** | Criar, editar, visualizar e excluir objetivos e KRs dentro dos limites de acesso. |
| **Pré-condições** | \- Usuário autenticado. <br>- Permissões para gerenciar OKRs. |
| **Fluxo Principal** | 1\. Acessa gestão de OKRs. <br>2. Cria objetivo com as tags: (título do objetivo, Indicador, data, e meta ). <br>3. Adiciona KRs (metas e valores). <br>4. Edita ou exclui OKRs existentes. |
| **Fluxos Alternativos** | \- Sem permissão: exibe acesso negado. <br>- Ciclo fechado: edição restrita. |
| **Pós-condições** | \- OKRs criados, editados ou excluídos. <br>- Alterações salvas no sistema. |

### 3.3 Acompanhamento de Progresso

| Campo | Descrição |
| --- | --- |
| **Atores** | Colaboradores, Gerentes |
| **Descrição** | Atualizar progresso dos KRs via check-ins, adicionar comentários e revisar histórico. |
| **Pré-condições** | \- Usuário autenticado. <br>- Permissões para atualizar KRs. |
| **Fluxo Principal** | 1\. Acessa acompanhamento de OKRs. <br>2. Seleciona KR. <br>3. Realiza check-in (valor atual). <br>4. Adiciona comentários. <br>5. Sistema atualiza progresso. |
| **Fluxos Alternativos** | \- KR concluído: impede atualizações. <br>- Ciclo fechado: atualizações restritas. |
| **Pós-condições** | \- Progresso do KR atualizado. <br>- Histórico e comentários salvos. |

### 3.4 Painel e Visualização

| Campo | Descrição |
| --- | --- |
| **Atores** | Todos os usuários |
| **Descrição** | Visualizar e filtrar dados do painel, interagir com cartões de OKRs. |
| **Pré-condições** | \- Usuário autenticado. |
| **Fluxo Principal** | 1\. Acessa painel principal. <br>2. Visualiza cartões de OKRs (progresso, status, gráficos). <br>3. Aplica filtros (responsável, departamento, etc.). <br>4. Clica em cartão para detalhes. |
| **Fluxos Alternativos** | \- Sem OKRs: exibe mensagem informativa. |
| **Pós-condições** | \- Dados de OKRs visualizados e interativos. |

### 3.5 Relatórios

| Campo | Descrição |
| --- | --- |
| **Atores** | Gerentes, Administradores |
| **Descrição** | Gerar/exportar relatórios e acessar painéis avançados. |
| **Pré-condições** | \- Usuário autenticado. <br>- Permissões para gerar relatórios. |
| **Fluxo Principal** | 1\. Acessa seção de relatórios. <br>2. Seleciona tipo (objetivo, equipe, etc.). <br>3. Aplica filtros. <br>4. Gera relatório com opções de exportação (PDF, Excel). |
| **Fluxos Alternativos** | \- Sem dados: exibe mensagem informativa. |
| **Pós-condições** | \- Relatório gerado e exportável. |

### 3.6 Notificações

| Campo | Descrição |
| --- | --- |
| **Atores** | Todos os usuários |
| **Descrição** | Receber alertas configuráveis para check-ins e eventos de ciclo. |
| **Pré-condições** | \- Usuário autenticado. <br>- Preferências de notificação configuradas. |
| **Fluxo Principal** | 1\. Sistema verifica eventos (check-ins pendentes, fim de ciclo). <br>2. Envia notificações (e-mail ou Slack). |
| **Fluxos Alternativos** | \- Sem preferências: usa configurações padrão. |
| **Pós-condições** | \- Usuário recebe notificações relevantes. |

### 3.7 Gestão de Usuários e Equipes

| Campo | Descrição |
| --- | --- |
| **Atores** | Administradores, Gerentes |
| **Descrição** | Gerenciar usuários, equipes e atribuições de objetivos. |
| **Pré-condições** | \- Usuário autenticado. <br>- Permissões para gerenciar usuários/equipes. |
| **Fluxo Principal** | 1\. Acessa gestão de usuários/equipes. <br>2. Cria, edita ou exclui usuários/equipes. <br>3. Atribui usuários a equipes e objetivos. |
| **Fluxos Alternativos** | \- Sem permissão: exibe acesso negado. |
| **Pós-condições** | \- Usuários/equipes gerenciados. <br>- Atribuições atualizadas. |

## 4. Sprints de Desenvolvimento

O projeto utilizará sprints de duas semanas em uma abordagem ágil. Abaixo estão as sprints detalhadas:

### Sprint 0: Reestruturação do Frontend

| Tarefa | Descrição |
| --- | --- |
| Analisar estrutura atual | Revisar pasta de frontend existente para entender organização e componentes. |
| Planejar nova estrutura | Definir organização que facilite integrações com o backend. |
| Reorganizar componentes/pastas | Mover e renomear arquivos conforme plano. |
| Atualizar imports/referências | Ajustar imports para nova estrutura. |
| Testar integridade | Verificar funcionamento do frontend após reestruturação. |

### Sprint 1: Fundação e Gestão de Usuários

| Tarefa | Descrição |
| --- | --- |
| Configurar controle de versão | Criar repositório (GitHub) e configurar branches. |
| Configurar CI/CD | Implementar pipeline de integração e deployment. |
| Implementar autenticação | Criar sistema de registro/login com JWT. |
| Desenvolver gestão de usuários | Criar interfaces/APIs para criar, editar e excluir usuários. |
| Implementar permissões | Definir e aplicar permissões por função (Admin, Gerente, Colaborador). |

### Sprint 2: Funcionalidade Central de OKRs

| Tarefa | Descrição |
| --- | --- |
| Criar modelos de dados OKRs | Definir schemas para Objetivos e KRs no backend. |
| Implementar APIs OKRs | Criar endpoints CRUD para Objetivos e KRs. |
| Desenvolver interfaces OKRs | Criar páginas frontend para criar, editar e visualizar OKRs. |
| Integrar frontend/backend | Conectar interfaces de OKRs às APIs. |

### Sprint 3: Acompanhamento de Progresso e Check-ins

| Tarefa | Descrição |
| --- | --- |
| Implementar check-ins | Criar funcionalidades para atualizar progresso dos KRs. |
| Adicionar comentários | Permitir adicionar comentários aos check-ins. |
| Desenvolver histórico | Criar visualização do histórico de check-ins por KR. |
| Calcular progresso automático | Implementar lógica para calcular progresso do objetivo baseado em KRs. |

### Sprint 4: Painel e Visualização

| Tarefa | Descrição |
| --- | --- |
| Desenvolver painel principal | Criar página inicial com cartões de OKRs e resumos. |
| Implementar filtros | Adicionar filtragem por responsável, departamento, etc. |
| Criar gráficos | Usar Chart.js para evolução do progresso dos OKRs. |
| Adicionar indicadores visuais | Incluir badges/ícones para status dos OKRs. |

### Sprint 5: Relatórios e Exportação

| Tarefa | Descrição |
| --- | --- |
| Desenvolver relatórios | Criar funcionalidades para gerar relatórios com filtros. |
| Implementar exportação | Usar bibliotecas para gerar PDF e Excel. |
| Criar painéis avançados | Desenvolver dashboards detalhados e interativos. |

### Sprint 6: Notificações e Integrações

| Tarefa | Descrição |
| --- | --- |
| Configurar notificações | Implementar lógica para enviar notificações em eventos específicos. |
| Integrar e-mail | Configurar envio de e-mails (ex.: SendGrid). |
| Integrar Slack | Usar API do Slack para notificações. |
| Adicionar preferências | Permitir configuração de notificações pelo usuário. |

### Sprint 7: Polimento de UI/UX

| Tarefa | Descrição |
| --- | --- |
| Coletar feedback | Realizar testes com usuários para identificar melhorias. |
| Refinar interfaces | Ajustar design/usabilidade com base no feedback. |
| Finalizar pendências | Completar funcionalidades restantes das sprints anteriores. |

### Sprint 8: Testes e QA

| Tarefa | Descrição |
| --- | --- |
| Testes unitários | Testar componentes e funções individualmente. |
| Testes de integração | Verificar interação entre módulos. |
| Testes end-to-end | Simular cenários reais de uso. |
| Corrigir bugs | Resolver problemas identificados nos testes. |
| Otimizar desempenho | Melhorar áreas com desempenho abaixo do esperado. |

### Sprint 9: Implantação

| Tarefa | Descrição |
| --- | --- |
| Preparar produção | Configurar servidores, bancos de dados e serviços. |
| Deploy da aplicação | Implantar código no ambiente de produção. |
| Criar documentação | Elaborar guias/manuais para usuários finais. |
| Configurar monitoramento | Implementar ferramentas para monitorar saúde/desempenho da aplicação. |

## 5. Arquitetura Técnica

### 5.1 Backend

- **Framework:** Python com FastAPI.
- **Banco de Dados:** PostgreSQL (Supabase).
- **API:** RESTful para comunicação com o frontend.
- **Autenticação:** Baseada em JWT.
- **Pagamento:** Asaas.

### 5.2 Frontend

- **Framework:** React.
- **Biblioteca de UI:** Tailwind.
- **Gráficos:** Chart.js para visualizações.
- **Design Responsivo:** Acessível em todos os dispositivos.

### 5.3 Integrações

- **E-mail:** Para notificações.
- **Slack:** Integração de API para alertas.
- **Exportação:** Bibliotecas de geração de PDF/Excel.

## 6. Apêndices

### 6.1 Glossário

- **OKR:** Objetivos e Resultados-Chave.
- **Objetivo:** Meta estratégica qualitativa.
- **KR:** Resultado mensurável vinculado a um objetivo.
- **Ciclo:** Período de tempo definido para OKRs.

### 6.2 Notas

- Designs de UI alinhados com o mockup do stakeholder (image1.png).
- Detalhes adicionais (ex.: pilha de tecnologia) a definir com o stakeholder.