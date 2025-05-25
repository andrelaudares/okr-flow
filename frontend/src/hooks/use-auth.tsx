
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface AuthState {
  user: { id: string; name: string; email: string } | null;
  session: Session | null;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  login: (user: { id: string; name: string; email: string }) => void;
  logout: () => void;
  isLoggedIn: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Check if there's a user in localStorage first
    const storedUser = localStorage.getItem("nobugOkrUser");

    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setState(prev => ({
          ...prev,
          user: userData,
          loading: false,
        }));
        console.log("Loaded user from localStorage:", userData.email);
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("nobugOkrUser");
      }
    } else {
      setState(prev => ({
        ...prev,
        loading: false,
      }));
    }

    // Set up Supabase auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Supabase auth state changed:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session) {
          // User is signed in
          const userData = {
            id: session.user.id,
            name: session.user.user_metadata?.name || '',
            email: session.user.email || '',
          };

          setState({
            session,
            user: userData,
            loading: false,
          });

          // Update localStorage
          localStorage.setItem("nobugOkrUser", JSON.stringify(userData));
          console.log('User signed in:', userData.email);
        } 
        else if (event === 'SIGNED_OUT') {
          // User is signed out
          setState({
            user: null,
            session: null,
            loading: false,
          });
          
          localStorage.removeItem("nobugOkrUser");
          console.log('User signed out');
        }
      }
    );

    // Then check for existing Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && !state.user) {
        const userData = {
          id: session.user.id,
          name: session.user.user_metadata?.name || '',
          email: session.user.email || '',
        };

        setState({
          session,
          user: userData,
          loading: false,
        });

        localStorage.setItem("nobugOkrUser", JSON.stringify(userData));
        console.log('Found existing session for:', userData.email);
      } else if (!session && !storedUser) {
        setState(prev => ({
          ...prev,
          loading: false,
        }));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = (user: { id: string; name: string; email: string }) => {
    setState(prev => ({
      ...prev,
      user,
      loading: false,
    }));
    
    localStorage.setItem("nobugOkrUser", JSON.stringify(user));
    console.log('Manual login executed for:', user.email);
  };

  const logout = async () => {
    try {
      // First clear local state
      setState({
        user: null,
        session: null,
        loading: false,
      });
      
      // Clear localStorage
      localStorage.removeItem("nobugOkrUser");
      
      // Then try to sign out from Supabase
      await supabase.auth.signOut();
      
      toast.success('Logout realizado com sucesso');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Erro ao fazer logout');
    }
  };

  const isLoggedIn = !!state.user;
  
  // Create context value with both isLoggedIn and isAuthenticated
  const contextValue = {
    ...state,
    login,
    logout,
    isLoggedIn,
    isAuthenticated: isLoggedIn // Add isAuthenticated as alias
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
