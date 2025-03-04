import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, ExternalLink, Edit, Trash2, Settings, BarChart2, ArrowRight, CreditCard, AlertTriangle, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Layout from '../components/layout/Layout';
import { getCurrentUser } from '../lib/auth';
import { getSubscriptionStatus } from '../lib/subscriptions';
import { SubscriptionStatus } from '../types';

const DashboardPage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        
        if (currentUser) {
          setUserRole(currentUser.role);
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    };
    
    loadUserData();
  }, []);
  
  useEffect(() => {
    const loadSubscriptionStatus = async () => {
      if (userRole === 'admin') {
        try {
          setIsLoading(true);
          const subscription = await getSubscriptionStatus();
          setSubscriptionStatus(subscription.status);
        } catch (error) {
          console.error('Failed to load subscription status:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    
    if (userRole) {
      loadSubscriptionStatus();
    }
  }, [userRole]);
  
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400">Welcome back, {user?.name}</p>
        </div>
        
        {userRole === 'admin' && subscriptionStatus === 'canceled' && !isLoading && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 dark:bg-amber-900/30 dark:border-amber-600">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-amber-800 dark:text-amber-300">Subscription Required</h3>
                <div className="mt-2 text-sm text-amber-700 dark:text-amber-400">
                  <p>You don't have an active subscription. Subscribe now to access all features.</p>
                </div>
                <div className="mt-4">
                  <Link to="/plans">
                    <Button size="sm">
                      View Plans
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 rounded-md bg-blue-100 dark:bg-blue-900/30">
                  <Plus className="h-6 w-6 text-blue-700 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Clients</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">12</h3>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 rounded-md bg-green-100 dark:bg-green-900/30">
                  <ExternalLink className="h-6 w-6 text-green-700 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Websites</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">8</h3>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 rounded-md bg-purple-100 dark:bg-purple-900/30">
                  <BarChart2 className="h-6 w-6 text-purple-700 dark:text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Consent Rate</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">76%</h3>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 rounded-md bg-amber-100 dark:bg-amber-900/30">
                  <Edit className="h-6 w-6 text-amber-700 dark:text-amber-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Snippets</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">15</h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Quick Actions</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userRole && (userRole === 'admin' || userRole === 'superadmin') && (
                  <Link to="/clients/new">
                    <Button
                      variant="outline"
                      fullWidth
                      leftIcon={<Plus className="h-4 w-4" />}
                      rightIcon={<ArrowRight className="h-4 w-4" />}
                    >
                      Add New Client
                    </Button>
                  </Link>
                )}
                
                <Link to="/settings">
                  <Button
                    variant="outline"
                    fullWidth
                    leftIcon={<Settings className="h-4 w-4" />}
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                  >
                    Customize Branding
                  </Button>
                </Link>
                
                <Link to="/analytics">
                  <Button
                    variant="outline"
                    fullWidth
                    leftIcon={<BarChart2 className="h-4 w-4" />}
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                  >
                    View Analytics
                  </Button>
                </Link>
                
                {userRole === 'admin' && (
                  <Link to="/plans">
                    <Button
                      variant="outline"
                      fullWidth
                      leftIcon={<CreditCard className="h-4 w-4" />}
                      rightIcon={<ArrowRight className="h-4 w-4" />}
                    >
                      View Subscription Plans
                    </Button>
                  </Link>
                )}
                
                {userRole === 'superadmin' && (
                  <Link to="/domain-settings">
                    <Button
                      variant="outline"
                      fullWidth
                      leftIcon={<Globe className="h-4 w-4" />}
                      rightIcon={<ArrowRight className="h-4 w-4" />}
                    >
                      Domain Settings
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Activity</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4 py-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">New client added</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">2 hours ago</p>
                </div>
                
                <div className="border-l-4 border-green-500 pl-4 py-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Consent popup updated</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Yesterday</p>
                </div>
                
                <div className="border-l-4 border-purple-500 pl-4 py-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Branding settings changed</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">3 days ago</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {userRole === 'superadmin' && (
          <Card>
            <CardHeader>
              <CardTitle>SuperAdmin Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="border rounded-lg p-4 dark:border-gray-700">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Admin Management</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Manage admin users and their permissions</p>
                  <Link to="/admins">
                    <Button size="sm" variant="outline" fullWidth>
                      Manage Admins
                    </Button>
                  </Link>
                </div>
                
                <div className="border rounded-lg p-4 dark:border-gray-700">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Subscription Plans</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Manage plans and view revenue</p>
                  <Link to="/admin-billing">
                    <Button size="sm" variant="outline" fullWidth>
                      Manage Plans
                    </Button>
                  </Link>
                </div>
                
                <div className="border rounded-lg p-4 dark:border-gray-700">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Activity Log</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Monitor system activity and user actions</p>
                  <Link to="/activity-log">
                    <Button size="sm" variant="outline" fullWidth>
                      View Activity
                    </Button>
                  </Link>
                </div>
                
                <div className="border rounded-lg p-4 dark:border-gray-700">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Domain Settings</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Configure root domain and endpoints</p>
                  <Link to="/domain-settings">
                    <Button size="sm" variant="outline" fullWidth>
                      Configure Domains
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default DashboardPage;
