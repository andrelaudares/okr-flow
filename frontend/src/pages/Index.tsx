import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Flag, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white/70 backdrop-blur-md border-b border-nobug-100 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 group">
            <div className="rounded-full bg-gradient-to-br from-nobug-600 to-nobug-400 p-2 flex items-center justify-center shadow-lg hover:shadow-nobug-300/50 transition-all duration-300">
              <Flag size={26} color="#fff" fill="#fff" strokeWidth={2} />
            </div>
            <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-nobug-600 to-nobug-400 text-transparent bg-clip-text group-hover:from-nobug-700 group-hover:to-nobug-500 transition-colors">
              NOBUG <span className="font-bold">OKRs</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Button onClick={() => navigate('/dashboard')} className="shadow-md hover:shadow-nobug-200/50">
                Ir para Dashboard
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => navigate('/login')}>
                  Login
                </Button>
                <Button onClick={() => navigate('/register')} className="shadow-md hover:shadow-nobug-200/50">
                  Cadastrar
                </Button>
              </>
            )}
          </div>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col">
        <section className="relative py-20 px-4 overflow-hidden">
          {/* Background with gradient and pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-nobug-50/80 via-white to-nobug-100/50 -z-10" />
          <div 
            className="absolute inset-0 opacity-5 -z-10" 
            style={{
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231976D2' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            }}
          />
          
          <div className="container mx-auto max-w-6xl flex flex-col-reverse md:flex-row items-center gap-12">
            <div className="flex-1 text-center md:text-left space-y-6 animate-fade-in">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900">
                <span className="block">Gerencie seus</span>
                <span className="text-nobug-500">OKRs</span> com 
                <span className="relative ml-2 whitespace-nowrap">
                  <svg aria-hidden="true" viewBox="0 0 418 42" className="absolute top-2/3 left-0 h-[0.6em] w-full fill-nobug-300/40" preserveAspectRatio="none">
                    <path d="M203.371.916c-26.013-2.078-76.686 1.963-124.73 9.946L67.3 12.749C35.421 18.062 18.2 21.766 6.004 25.934 1.244 27.561.828 27.778.874 28.61c.07 1.214.828 1.121 9.595-1.176 9.072-2.377 17.15-3.92 39.246-7.496C123.565 7.986 157.869 4.492 195.942 5.046c7.461.108 19.25 1.696 19.17 2.582-.107 1.183-7.874 4.31-25.75 10.366-21.992 7.45-35.43 12.534-36.701 13.884-2.173 2.308-.202 4.407 4.442 4.734 2.654.187 3.263.157 15.593-.78 35.401-2.686 57.944-3.488 88.365-3.143 46.327.526 75.721 2.23 130.788 7.584 19.787 1.924 20.814 1.98 24.557 1.332l.066-.011c1.201-.203 1.53-1.825.399-2.335-2.911-1.31-4.893-1.604-22.048-3.261-57.509-5.556-87.871-7.36-132.059-7.842-23.239-.254-33.617-.116-50.627.674-11.629.54-42.371 2.494-46.696 2.967-2.359.259 8.133-3.625 26.504-9.81 23.239-7.825 27.934-10.149 28.304-14.005.417-4.348-3.529-6-16.878-7.066Z" />
                  </svg>
                  <span className="relative"> resultados</span>
                </span>
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto md:mx-0">
                Plataforma visual que ajuda equipes a definir metas claras, acompanhar o progresso e mensurar resultados de forma eficiente.
              </p>
              <div className="flex gap-4 justify-center md:justify-start pt-4">
                {isAuthenticated ? (
                  <Button 
                    size="lg" 
                    className="px-6 py-6 text-lg flex items-center gap-2 shadow-xl bg-gradient-to-r from-nobug-600 to-nobug-500 hover:from-nobug-700 hover:to-nobug-600 border-none transition-all duration-300"
                    onClick={() => navigate('/dashboard')}
                  >
                    Ir para Dashboard
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                ) : (
                  <>
                    <Button 
                      size="lg" 
                      className="px-6 py-6 text-lg flex items-center gap-2 shadow-xl bg-gradient-to-r from-nobug-600 to-nobug-500 hover:from-nobug-700 hover:to-nobug-600 border-none transition-all duration-300"
                      onClick={() => navigate('/register')}
                    >
                      Começar agora
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg"
                      className="px-6 py-6 text-lg border-nobug-200 hover:bg-nobug-50/50"
                      onClick={() => navigate('/login')}
                    >
                      Fazer login
                    </Button>
                  </>
                )}
              </div>
              
              {/* Trust indicators */}
              <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-6">
                <div className="flex items-center text-sm text-gray-500 gap-1">
                  <CheckCircle size={18} className="text-nobug-500" />
                  <span>Fácil de usar</span>
                </div>
                <div className="flex items-center text-sm text-gray-500 gap-1">
                  <CheckCircle size={18} className="text-nobug-500" />
                  <span>Intuitivo</span>
                </div>
                <div className="flex items-center text-sm text-gray-500 gap-1">
                  <CheckCircle size={18} className="text-nobug-500" />
                  <span>Colaborativo</span>
                </div>
              </div>
            </div>
            
            <div className="flex-1 w-full max-w-md mx-auto md:mx-0">
              <div className="relative">
                {/* Card shadow effect */}
                <div className="absolute -bottom-6 -right-6 w-full h-full rounded-2xl bg-nobug-300/20 -z-10"></div>
                
                {/* Main image */}
                <div className="relative w-full aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-all duration-500">
                  <div className="absolute inset-0 bg-gradient-to-tr from-nobug-600/30 to-transparent mix-blend-multiply"></div>
                  <img 
                    src="https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=1470&auto=format&fit=crop" 
                    alt="OKRs Dashboard Preview" 
                    className="object-cover w-full h-full"
                  />
                  
                  {/* Floating card effect */}
                  <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg max-w-[200px] animate-fade-in">
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                      <div className="bg-nobug-500 h-full rounded-full w-[75%]"></div>
                    </div>
                    <p className="text-sm font-medium text-gray-800">Objetivos em progresso</p>
                    <p className="text-xs text-gray-500">75% completados este mês</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-b from-white to-gray-50/80 py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-center mb-4">Principais Funcionalidades</h2>
            <p className="text-lg text-gray-600 text-center max-w-2xl mx-auto mb-12">
              Uma plataforma completa para acompanhar objetivos e resultados-chave de sua equipe
            </p>
            
            <div className="grid gap-8 md:grid-cols-3">
              <div className="group bg-white hover:bg-gradient-to-br from-white to-nobug-50/50 p-6 rounded-xl shadow hover:shadow-lg transition-all duration-300">
                <div className="bg-nobug-100/80 rounded-lg w-12 h-12 flex items-center justify-center mb-4 group-hover:bg-nobug-200/80 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-nobug-600"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 group-hover:text-nobug-600 transition-colors">Acompanhamento visual</h3>
                <p className="text-gray-600">Monitore o progresso com indicadores visuais e dashboards que mostram o status rapidamente.</p>
              </div>
              
              <div className="group bg-white hover:bg-gradient-to-br from-white to-nobug-50/50 p-6 rounded-xl shadow hover:shadow-lg transition-all duration-300">
                <div className="bg-nobug-100/80 rounded-lg w-12 h-12 flex items-center justify-center mb-4 group-hover:bg-nobug-200/80 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-nobug-600"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 group-hover:text-nobug-600 transition-colors">Colaboração em equipe</h3>
                <p className="text-gray-600">Atribua atividades aos membros da equipe e acompanhe as contribuições individuais para cada objetivo.</p>
              </div>
              
              <div className="group bg-white hover:bg-gradient-to-br from-white to-nobug-50/50 p-6 rounded-xl shadow hover:shadow-lg transition-all duration-300">
                <div className="bg-nobug-100/80 rounded-lg w-12 h-12 flex items-center justify-center mb-4 group-hover:bg-nobug-200/80 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-nobug-600"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 group-hover:text-nobug-600 transition-colors">Relatórios de progresso</h3>
                <p className="text-gray-600">Tenha insights sobre o progresso geral dos objetivos com cálculos automáticos e análises detalhadas.</p>
              </div>
            </div>
          </div>
        </section>
        
        <section className="py-16 px-4 bg-white relative overflow-hidden">
          {/* Background pattern */}
          <div 
            className="absolute inset-0 opacity-[0.03] -z-10" 
            style={{
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M9 0h2v20H9V0zm25.134.84l1.732 1-10 17.32-1.732-1 10-17.32zm-20 20l1.732 1-10 17.32-1.732-1 10-17.32zM58.16 4.134l1 1.732-17.32 10-1-1.732 17.32-10zm-40 40l1 1.732-17.32 10-1-1.732 17.32-10zM80 9v2H60V9h20zM20 69v2H0v-2h20zm79.32-55l-1 1.732-17.32-10L82 4l17.32 10zm-80 80l-1 1.732-17.32-10L2 84l17.32 10zm96.546-75.84l-1.732 1-10-17.32 1.732-1 10 17.32zm-100 100l-1.732 1-10-17.32 1.732-1 10 17.32zM38.16 24.134l1 1.732-17.32 10-1-1.732 17.32-10zM60 29v2H40v-2h20zm19.32 5l-1 1.732-17.32-10L62 24l17.32 10zm16.546 4.16l-1.732 1-10-17.32 1.732-1 10 17.32zM111 40h-2V20h2v20zm3.134.84l1.732 1-10 17.32-1.732-1 10-17.32zm24.026 3.294l1 1.732-17.32 10-1-1.732 17.32-10zM39.32 74l-1 1.732-17.32-10L22 64l17.32 10zm16.546 4.16l-1.732 1-10-17.32 1.732-1 10 17.32zM71 80h-2V60h2v20zm3.134.84l1.732 1-10 17.32-1.732-1 10-17.32zm24.026 3.294l1 1.732-17.32 10-1-1.732 17.32-10zM120 89v2h-20v-2h20zm-84.134 9.16l-1.732 1-10-17.32 1.732-1 10 17.32zM51 100h-2V80h2v20zm3.134.84l1.732 1-10 17.32-1.732-1 10-17.32zm24.026 3.294l1 1.732-17.32 10-1-1.732 17.32-10zM100 109v2H80v-2h20zm19.32 5l-1 1.732-17.32-10 1-1.732 17.32 10zM31 120h-2v-20h2v20z' fill='%231976D2' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E\")",
            }}
          />
          <div className="container mx-auto text-center max-w-4xl relative z-10">
            <div className="bg-nobug-50/50 backdrop-blur-sm p-8 md:p-12 rounded-2xl border border-nobug-100/30 shadow-lg">
              <h2 className="text-3xl font-bold mb-6">Pronto para aumentar o foco do seu time?</h2>
              <p className="text-xl text-gray-600 mb-10">
                {isAuthenticated 
                  ? "Continue gerenciando seus OKRs e alcance resultados extraordinários."
                  : "Cadastre-se no Nobug OKRs e comece hoje mesmo a acompanhar objetivos e resultados com eficiência."
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {isAuthenticated ? (
                  <Button 
                    size="lg"
                    onClick={() => navigate('/dashboard')}
                    className="px-8 py-6 text-lg shadow-lg bg-gradient-to-r from-nobug-600 to-nobug-500 hover:from-nobug-700 hover:to-nobug-600 border-none transition-all duration-300"
                  >
                    Ir para Dashboard
                  </Button>
                ) : (
                  <>
                    <Button 
                      size="lg"
                      onClick={() => navigate('/register')}
                      className="px-8 py-6 text-lg shadow-lg bg-gradient-to-r from-nobug-600 to-nobug-500 hover:from-nobug-700 hover:to-nobug-600 border-none transition-all duration-300"
                    >
                      Começar gratuitamente
                    </Button>
                    <Button 
                      variant="outline"
                      size="lg"
                      onClick={() => navigate('/login')}
                      className="px-8 py-6 text-lg border-nobug-200 hover:bg-nobug-50/80"
                    >
                      Fazer login
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="bg-gray-50 py-8 px-4 border-t border-gray-200">
        <div className="container mx-auto text-center text-gray-600">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="rounded-full bg-nobug-500/80 p-1.5 flex items-center justify-center">
              <Flag size={16} color="#fff" />
            </div>
            <span className="font-semibold tracking-tight">NOBUG OKRs</span>
          </div>
          <p>© 2025 Nobug OKRs. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
