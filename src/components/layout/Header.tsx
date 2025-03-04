import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Settings, User, Clock, Globe, Info, CreditCard, BarChart2, ChevronDown, HelpCircle, Shield, Activity } from 'lucide-react';
import { logout, getCurrentUser, hasRole } from '../../lib/auth';
import Button from '../ui/Button';
import ThemeToggle from '../ui/ThemeToggle';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [userRoles, setUserRoles] = useState({
    isSuperAdmin: false,
    isAdmin: false
  });
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        
        if (currentUser) {
          const isSuperAdmin = currentUser.role === 'superadmin';
          const isAdmin = currentUser.role === 'admin' || currentUser.role === 'superadmin';
          setUserRoles({ isSuperAdmin, isAdmin });
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUser();
  }, []);
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
  
  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Close user menu when navigating
  useEffect(() => {
    setShowUserMenu(false);
  }, [location.pathname]);
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  if (isLoading) {
    return (
      <header className="bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="flex items-center">
                  <BarChart2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">ConsentHub</span>
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>
    );
  }
  
  return (
    <header className="bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                <BarChart2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">ConsentHub</span>
              </Link>
            </div>
            
            {user && (
              <nav className="ml-6 flex space-x-4 items-center">
                <Link
                  to="/dashboard"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/dashboard')
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                      : 'text-gray-900 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  Dashboard
                </Link>
                
                {userRoles.isSuperAdmin && (
                  <Link
                    to="/admins"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/admins')
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                        : 'text-gray-900 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    Admins
                  </Link>
                )}
                
                {userRoles.isAdmin && (
                  <Link
                    to="/clients"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/clients')
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                        : 'text-gray-900 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    Clients
                  </Link>
                )}
                
                <Link
                  to="/analytics"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/analytics')
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                      : 'text-gray-900 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  Analytics
                </Link>
                
                {userRoles.isSuperAdmin && (
                  <Link
                    to="/admin-billing"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/admin-billing')
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                        : 'text-gray-900 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    Plans & Billing
                  </Link>
                )}
                
                {userRoles.isSuperAdmin && (
                  <Link
                    to="/activity-log"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/activity-log')
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                        : 'text-gray-900 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    Activity Log
                  </Link>
                )}
                
                <Link
                  to="/help"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/help')
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                      : 'text-gray-900 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  Help
                </Link>
              </nav>
            )}
          </div>
          
          {user ? (
            <div className="flex items-center">
              <ThemeToggle />
              
              <div className="relative ml-3" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:hover:bg-gray-700"
                  aria-expanded={showUserMenu}
                  aria-haspopup="true"
                >
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-medium dark:bg-blue-800 dark:text-blue-100">
                    {user.name ? user.name.charAt(0) : '?'}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{user.name || 'User'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role || 'User'}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name || 'User'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user.email || 'user@example.com'}</p>
                    </div>
                    
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Link>
                    
                    <Link
                      to="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Link>
                    
                    {user && user.role === 'admin' && (
                      <Link
                        to="/billing"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center dark:text-gray-200 dark:hover:bg-gray-700"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Billing
                      </Link>
                    )}
                    
                    {userRoles.isSuperAdmin && (
                      <Link
                        to="/domain-settings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center dark:text-gray-200 dark:hover:bg-gray-700"
                      >
                        <Globe className="h-4 w-4 mr-2" />
                        Domain Settings
                      </Link>
                    )}
                    
                    <Link
                      to="/help"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                      <HelpCircle className="h-4 w-4 mr-2" />
                      Help Center
                    </Link>
                    
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center">
              <ThemeToggle />
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/login')}
              >
                Sign In
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
