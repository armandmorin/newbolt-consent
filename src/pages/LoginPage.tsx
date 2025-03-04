import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BarChart2 } from 'lucide-react';
import { isAuthenticated } from '../lib/auth';
import LoginForm from '../components/auth/LoginForm';
import Layout from '../components/layout/Layout';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  const from = location.state?.from?.pathname || '/dashboard';
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setCheckingAuth(true);
        const authenticated = await isAuthenticated();
        if (authenticated) {
          navigate(from, { replace: true });
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        setCheckingAuth(false);
      }
    };
    
    checkAuth();
  }, [navigate, from]);
  
  const handleLoginSuccess = () => {
    navigate(from, { replace: true });
  };
  
  if (checkingAuth) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }
  
  return (
    <Layout requireAuth={false}>
      <div className="flex min-h-[80vh] flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <BarChart2 className="h-12 w-12 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Sign in to ConsentHub
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Manage GDPR consent popups for your websites
          </p>
        </div>
        
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 dark:bg-gray-800">
            <LoginForm onSuccess={handleLoginSuccess} />
            
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                    Default SuperAdmin
                  </span>
                </div>
              </div>
              
              <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                <p>Email: armandmorin@gmail.com</p>
                <p>Password: 1armand</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;
