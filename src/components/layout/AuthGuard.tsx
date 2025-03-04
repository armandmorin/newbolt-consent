import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, hasRole, refreshToken, getCurrentUser } from '../../lib/auth';
import { UserRole } from '../../types';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, requiredRoles }) => {
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsChecking(true);
        
        // First check if user is authenticated
        const authenticated = await isAuthenticated();
        
        if (!authenticated) {
          setIsAuthorized(false);
          setIsChecking(false);
          return;
        }
        
        // Get the current user
        const user = await getCurrentUser();
        
        if (!user) {
          setIsAuthorized(false);
          setIsChecking(false);
          return;
        }
        
        // Special case for armandmorin@gmail.com - always grant superadmin access
        if (user.email.toLowerCase() === 'armandmorin@gmail.com') {
          setIsAuthorized(true);
          setIsChecking(false);
          return;
        }
        
        // If roles are required, check if user has the required role
        if (requiredRoles && requiredRoles.length > 0) {
          const authorized = await hasRole(requiredRoles);
          setIsAuthorized(authorized);
        } else {
          // If no specific roles required, just being authenticated is enough
          setIsAuthorized(true);
        }
        
        setIsChecking(false);
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthorized(false);
        setIsChecking(false);
      }
    };
    
    checkAuth();
  }, [location.pathname, requiredRoles]);
  
  // Separate useEffect for token refresh to avoid infinite loop
  useEffect(() => {
    const checkAndRefreshToken = async () => {
      try {
        // Only refresh token if user is authenticated
        if (await isAuthenticated()) {
          await refreshToken();
        }
      } catch (error) {
        console.error('Error refreshing token:', error);
      }
    };
    
    checkAndRefreshToken();
    
    // Set up a timer to refresh the token periodically (e.g., every 15 minutes)
    const refreshInterval = setInterval(async () => {
      try {
        if (await isAuthenticated()) {
          await refreshToken();
        }
      } catch (error) {
        console.error('Error refreshing token:', error);
      }
    }, 15 * 60 * 1000); // 15 minutes
    
    return () => clearInterval(refreshInterval);
  }, []);
  
  if (isChecking) {
    // Show loading state while checking authentication
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }
  
  if (!isAuthorized) {
    // Redirect to login if not authenticated or not authorized
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Render children if authenticated and authorized
  return <>{children}</>;
};

export default AuthGuard;
