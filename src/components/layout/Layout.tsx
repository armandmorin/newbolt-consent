import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import AuthGuard from './AuthGuard';
import { UserRole } from '../../types';

interface LayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRoles?: UserRole[];
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  requireAuth = true,
  requiredRoles
}) => {
  const location = useLocation();
  
  // If authentication is not required, render without AuthGuard
  if (!requireAuth) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    );
  }
  
  // If authentication is required, wrap with AuthGuard
  return (
    <AuthGuard requiredRoles={requiredRoles}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
};

export default Layout;
