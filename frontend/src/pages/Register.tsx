
import React, { useEffect } from 'react';
import RegisterForm from '@/components/auth/register-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Flag } from 'lucide-react';
import { Link } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md mb-8 animate-fade-in">
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="rounded-full bg-gradient-to-br from-nobug-600 to-nobug-400 p-2 flex items-center justify-center shadow-lg">
              <Flag className="h-6 w-6 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-nobug-600 to-nobug-500 bg-clip-text text-transparent mb-2">NOBUG OKRs</h1>
          <p className="text-center text-gray-500">Crie uma conta para começar</p>
        </div>
      </div>
      <div className="w-full max-w-md">
        <RegisterForm />
      </div>
      
    </div>
  );
};

export default Register;
