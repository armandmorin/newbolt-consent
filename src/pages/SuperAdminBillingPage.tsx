import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell
} from 'recharts';
import { 
  DollarSign, Users, CreditCard, Calendar, Download, RefreshCw, 
  TrendingUp, PieChart as PieChartIcon, CheckCircle, AlertTriangle, XCircle,
  Edit, Trash2, Save, X, ExternalLink, Plus
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Layout from '../components/layout/Layout';
import { getAllAdminSubscriptions, getSubscriptionRevenue, getSubscriptionPlans } from '../lib/subscriptions';
import { SubscriptionPlan, SubscriptionStatus } from '../types';
import { useNotification } from '../context/NotificationContext';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const SuperAdminBillingPage: React.FC = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminSubscriptions, setAdminSubscriptions] = useState<Array<{
    adminId: string;
    adminName: string;
    email: string;
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    renewalDate: string;
  }>>([]);
  const [revenueData, setRevenueData] = useState<{
    totalRevenue: number;
    monthlyRecurringRevenue: number;
    planDistribution: Record<string, number>;
    revenueByMonth: Array<{ month: string; revenue: number }>;
  } | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'plans' | 'subscriptions'>('overview');
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Load subscription plans first as they're less likely to fail
        let plansData: SubscriptionPlan[] = [];
        try {
          plansData = await getSubscriptionPlans();
          setPlans(plansData);
        } catch (err) {
          console.error('Failed to load plans:', err);
          // Continue with other data loading
        }
        
        // Load admin subscriptions
        try {
          const subscriptionsData = await getAllAdminSubscriptions();
          setAdminSubscriptions(subscriptionsData);
        } catch (err) {
          console.error('Failed to load admin subscriptions:', err);
          // Continue with revenue data loading
        }
        
        // Load revenue data
        try {
          const revenueData = await getSubscriptionRevenue();
          setRevenueData(revenueData);
        } catch (err) {
          console.error('Failed to load revenue data:', err);
        }
      } catch (error: any) {
        console.error('Failed to load billing data:', error);
        setError(error?.message || 'Failed to load billing data. Please try refreshing the page.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Load subscription plans first
      try {
        const plansData = await getSubscriptionPlans();
        setPlans(plansData);
      } catch (err) {
        console.error('Failed to refresh plans:', err);
      }
      
      // Load admin subscriptions
      try {
        const subscriptionsData = await getAllAdminSubscriptions();
        setAdminSubscriptions(subscriptionsData);
      } catch (err) {
        console.error('Failed to refresh admin subscriptions:', err);
      }
      
      // Load revenue data
      try {
        const revenueData = await getSubscriptionRevenue();
        setRevenueData(revenueData);
      } catch (err) {
        console.error('Failed to refresh revenue data:', err);
      }
      
      showNotification('success', 'Data Refreshed', 'Billing data has been refreshed successfully.');
    } catch (error: any) {
      console.error('Failed to refresh billing data:', error);
      setError(error?.message || 'Failed to refresh billing data. Please try again.');
      showNotification('error', 'Error', 'Failed to refresh billing data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = () => {
    // In a real app, this would generate and download a CSV or Excel file
    showNotification('info', 'Export Started', 'Your billing data export has started');
  };

  const handleAddPlan = () => {
    setEditingPlan({
      id: '',
      name: '',
      price: 0,
      interval: 'month',
      features: [],
      limits: {
        clients: 5,
        visitors: 50000
      }
    });
    setShowPlanModal(true);
  };

  const handleEditPlan = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setShowPlanModal(true);
  };

  const handleDeletePlan = (planId: string) => {
    setShowDeleteConfirm(planId);
  };

  const confirmDeletePlan = (planId: string | null) => {
    if (!planId) return;
    
    // In a real app, this would call the API to delete the plan
    // For demo purposes, we'll just remove it from the local state
    setPlans(plans.filter(p => p.id !== planId));
    setShowDeleteConfirm(null);
    showNotification('success', 'Plan Deleted', 'The subscription plan has been deleted successfully.');
  };

  const handleSavePlan = (plan: SubscriptionPlan) => {
    // In a real app, this would call the API to create/update the plan
    // For demo purposes, we'll just update the local state
    if (plan.id) {
      // Update existing plan
      setPlans(plans.map(p => p.id === plan.id ? plan : p));
      showNotification('success', 'Plan Updated', 'The subscription plan has been updated successfully.');
    } else {
      // Create new plan
      const newPlan = {
        ...plan,
        id: `plan_${Date.now()}`
      };
      setPlans([...plans, newPlan]);
      showNotification('success', 'Plan Created', 'The subscription plan has been created successfully.');
    }
    
    setShowPlanModal(false);
    setEditingPlan(null);
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Prepare data for plan distribution pie chart
  const planDistributionData = revenueData ? 
    Object.entries(revenueData.planDistribution).map(([name, value]) => ({ name, value })) : [];

  // Get status badge style
  const getStatusBadge = (status: SubscriptionStatus) => {
    switch (status) {
      case 'active':
        return {
          icon: <CheckCircle className="h-4 w-4 text-green-500" />,
          className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
        };
      case 'trialing':
        return {
          icon: <Calendar className="h-4 w-4 text-blue-500" />,
          className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
        };
      case 'past_due':
        return {
          icon: <AlertTriangle className="h-4 w-4 text-amber-500" />,
          className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
        };
      case 'canceled':
        return {
          icon: <XCircle className="h-4 w-4 text-red-500" />,
          className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
        };
      default:
        return {
          icon: <AlertTriangle className="h-4 w-4 text-gray-500" />,
          className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
        };
    }
  };

  return (
    <Layout requiredRoles={['superadmin']}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Billing & Revenue</h1>
            <p className="text-gray-500 dark:text-gray-400">Manage subscriptions and track revenue</p>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw className="h-4 w-4" />}
              onClick={handleRefresh}
              isLoading={isLoading}
            >
              Refresh
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="h-4 w-4" />}
              onClick={handleExportData}
              disabled={isLoading}
            >
              Export
            </Button>
          </div>
        </div>
        
        <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700">
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'overview' 
                ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400' 
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'plans' 
                ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400' 
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('plans')}
          >
            Plans
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'subscriptions' 
                ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400' 
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('subscriptions')}
          >
            Subscriptions
          </button>
        </div>
        
        {error && (
          <div className="bg-red-50 p-4 rounded-md flex items-start dark:bg-red-900/30">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 dark:text-red-400" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center">
                        <div className="p-2 rounded-md bg-green-100 dark:bg-green-900/30">
                          <DollarSign className="h-6 w-6 text-green-700 dark:text-green-400" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</p>
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {revenueData ? formatCurrency(revenueData.totalRevenue) : '$0'}
                          </h3>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center">
                        <div className="p-2 rounded-md bg-blue-100 dark:bg-blue-900/30">
                          <TrendingUp className="h-6 w-6 text-blue-700 dark:text-blue-400" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Recurring Revenue</p>
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {revenueData ? formatCurrency(revenueData.monthlyRecurringRevenue) : '$0'}
                          </h3>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center">
                        <div className="p-2 rounded-md bg-purple-100 dark:bg-purple-900/30">
                          <Users className="h-6 w-6 text-purple-700 dark:text-purple-400" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Subscriptions</p>
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {adminSubscriptions.filter(sub => sub.status === 'active').length}
                          </h3>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center">
                        <div className="p-2 rounded-md bg-amber-100 dark:bg-amber-900/30">
                          <CreditCard className="h-6 w-6 text-amber-700 dark:text-amber-400" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Past Due</p>
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {adminSubscriptions.filter(sub => sub.status === 'past_due').length}
                          </h3>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <TrendingUp className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                          Revenue Trend
                        </CardTitle>
                        <CardDescription>
                          Monthly revenue over time
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80">
                          {revenueData && revenueData.revenueByMonth.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={revenueData.revenueByMonth}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis 
                                  tickFormatter={(value) => `$${value}`}
                                />
                                <Tooltip 
                                  formatter={(value) => [`$${value}`, 'Revenue']}
                                />
                                <Legend />
                                <Bar dataKey="revenue" name="Revenue" fill="#3b82f6" />
                              </BarChart>
                            </ResponsiveContainer>
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <p className="text-gray-500 dark:text-gray-400">No revenue data available</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <PieChartIcon className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                          Plan Distribution
                        </CardTitle>
                        <CardDescription>
                          Subscription plan breakdown
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64">
                          {planDistributionData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={planDistributionData}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  outerRadius={80}
                                  fill="#8884d8"
                                  dataKey="value"
                                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                  {planDistributionData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                              </PieChart>
                            </ResponsiveContainer>
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <p className="text-gray-500 dark:text-gray-400">No plan distribution data available</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="mt-6">
                      <CardHeader>
                        <CardTitle>Quick Links</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <Link to="/plans" className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
                            <div className="flex items-center">
                              <CreditCard className="h-5 w-5 text-blue-600 mr-3 dark:text-blue-400" />
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">Order Page</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">View the customer-facing plans page</p>
                              </div>
                            </div>
                            <ExternalLink className="h-4 w-4 text-gray-400" />
                          </Link>
                          
                          <button 
                            onClick={() => setActiveTab('plans')}
                            className="w-full flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                          >
                            <div className="flex items-center">
                              <Edit className="h-5 w-5 text-blue-600 mr-3 dark:text-blue-400" />
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">Manage Plans</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Edit subscription plans</p>
                              </div>
                            </div>
                            <ExternalLink className="h-4 w-4 text-gray-400" />
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </>
            )}
            
            {/* Plans Tab */}
            {activeTab === 'plans' && (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="flex items-center">
                        <CreditCard className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                        Subscription Plans
                      </CardTitle>
                      <CardDescription>
                        Manage the subscription plans available to admins
                      </CardDescription>
                    </div>
                    <Button
                      onClick={handleAddPlan}
                      leftIcon={<Plus className="h-4 w-4" />}
                    >
                      Add Plan
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-6 flex justify-between items-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      These plans will be displayed on the <Link to="/plans" className="text-blue-600 hover:underline dark:text-blue-400">order page</Link> for admins to purchase.
                    </p>
                    <Link to="/plans" className="text-blue-600 hover:underline flex items-center dark:text-blue-400">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View Order Page
                    </Link>
                  </div>
                  
                  {plans.length > 0 ? (
                    <div className="space-y-6">
                      {plans.map((plan) => (
                        <div key={plan.id} className="border rounded-lg overflow-hidden dark:border-gray-700">
                          <div className={`p-4 ${plan.isPopular ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-gray-800'}`}>
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                                <div className="mt-1 flex items-baseline">
                                  <span className="text-2xl font-bold text-gray-900 dark:text-white">${plan.price}</span>
                                  <span className="ml-1 text-gray-500 dark:text-gray-400">/{plan.interval}</span>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  leftIcon={<Edit className="h-4 w-4" />}
                                  onClick={() => handleEditPlan(plan)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  leftIcon={<Trash2 className="h-4 w-4 text-red-500" />}
                                  onClick={() => handleDeletePlan(plan.id)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </div>
                            
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Features</h4>
                                <ul className="mt-2 space-y-2">
                                  {plan.features.map((feature, index) => (
                                    <li key={index} className="flex items-start">
                                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                                      <span className="text-sm text-gray-600 dark:text-gray-400">{feature}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div>
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Limits</h4>
                                <ul className="mt-2 space-y-2">
                                  <li className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Clients</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                      {plan.limits.clients === Infinity ? 'Unlimited' : plan.limits.clients}
                                    </span>
                                  </li>
                                  <li className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Monthly Visitors</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                      {plan.limits.visitors === Infinity 
                                        ? 'Unlimited' 
                                        : `${(plan.limits.visitors / 1000).toFixed(0)}K`}
                                    </span>
                                  </li>
                                </ul>
                              </div>
                            </div>
                            
                            {plan.isPopular && (
                              <div className="mt-4">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                  Popular Plan
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-500 dark:text-gray-400">No subscription plans found</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={handleAddPlan}
                      >
                        Add Your First Plan
                      </Button>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Manage the plans that will be available for purchase
                  </p>
                  <Link to="/plans">
                    <Button>
                      View Order Page
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            )}
            
            {/* Subscriptions Tab */}
            {activeTab === 'subscriptions' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                    Admin Subscriptions
                  </CardTitle>
                  <CardDescription>
                    All admin subscription statuses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {adminSubscriptions.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:text-gray-300 dark:bg-gray-800">
                          <tr>
                            <th className="px-4 py-3">Admin</th>
                            <th className="px-4 py-3">Email</th>
                            <th className="px-4 py-3">Plan</th>
                            <th className="px-4 py-3">Price</th>
                            <th className="px-4 py-3">Renewal Date</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {adminSubscriptions.map((subscription) => {
                            const { icon, className } = getStatusBadge(subscription.status);
                            return (
                              <tr key={subscription.adminId} className="bg-white border-b hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600">
                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                                  {subscription.adminName}
                                </td>
                                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                                  {subscription.email}
                                </td>
                                <td className="px-4 py-3">
                                  {subscription.plan.name}
                                </td>
                                <td className="px-4 py-3">
                                  ${subscription.plan.price}/{subscription.plan.interval}
                                </td>
                                <td className="px-4 py-3">
                                  {new Date(subscription.renewalDate).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center w-fit space-x-1 ${className}`}>
                                    {icon}
                                    <span>{subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}</span>
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      // In a real app, this would navigate to a detailed view
                                      showNotification('info', 'View Details', `Viewing details for ${subscription.adminName}`);
                                    }}
                                  >
                                    View Details
                                  </Button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-500 dark:text-gray-400">No admin subscriptions found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}
        
        {/* Plan Edit/Create Modal */}
        {showPlanModal && editingPlan && (
          <PlanEditModal 
            plan={editingPlan} 
            onSave={handleSavePlan} 
            onCancel={() => setShowPlanModal(false)} 
          />
        )}
        
        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-modal="true">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full dark:bg-gray-800">
              <div className="flex items-center mb-4">
                <AlertTriangle className="h-6 w-6 text-red-500 mr-2" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Delete Plan</h3>
              </div>
              
              <p className="text-sm text-gray-600 mb-4 dark:text-gray-400">
                Are you sure you want to delete this subscription plan? This action cannot be undone.
              </p>
              
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={() => confirmDeletePlan(showDeleteConfirm)}
                >
                  Delete Plan
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

interface PlanEditModalProps {
  plan: SubscriptionPlan;
  onSave: (plan: SubscriptionPlan) => void;
  onCancel: () => void;
}

const PlanEditModal: React.FC<PlanEditModalProps> = ({ plan, onSave, onCancel }) => {
  const [formData, setFormData] = useState<SubscriptionPlan>({...plan});
  const [features, setFeatures] = useState<string[]>(plan.features || []);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'price') {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0
      });
    } else if (name === 'isPopular' && type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked
      });
    } else if (name === 'clientLimit') {
      const clientLimit = value === 'unlimited' ? Infinity : parseInt(value) || 0;
      setFormData({
        ...formData,
        limits: {
          ...formData.limits,
          clients: clientLimit
        }
      });
    } else if (name === 'visitorLimit') {
      const visitorLimit = value === 'unlimited' ? Infinity : parseInt(value) * 1000 || 0;
      setFormData({
        ...formData,
        limits: {
          ...formData.limits,
          visitors: visitorLimit
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const handleFeatureChange = (index: number, value: string) => {
    const updatedFeatures = [...features];
    updatedFeatures[index] = value;
    setFeatures(updatedFeatures);
  };
  
  const addFeature = () => {
    setFeatures([...features, '']);
  };
  
  const removeFeature = (index: number) => {
    const updatedFeatures = [...features];
    updatedFeatures.splice(index, 1);
    setFeatures(updatedFeatures);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter out empty features
    const filteredFeatures = features.filter(f => f.trim() !== '');
    
    onSave({
      ...formData,
      features: filteredFeatures
    });
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-modal="true">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full dark:bg-gray-800">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {plan.id ? 'Edit Subscription Plan' : 'Create Subscription Plan'}
          </h3>
          <button 
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Plan Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Basic, Professional, Enterprise"
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Price
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400">
                  $
                </span>
                <input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="29.99"
                  required
                  className="flex-1 rounded-none rounded-r-md border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="interval" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Billing Interval
              </label>
              <select
                id="interval"
                name="interval"
                value={formData.interval}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              >
                <option value="month">Monthly</option>
                <option value="year">Yearly</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="isPopular" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <input
                  id="isPopular"
                  name="isPopular"
                  type="checkbox"
                  checked={formData.isPopular || false}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                />
                Mark as Popular Plan
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Popular plans will be highlighted to users
              </p>
            </div>
            
            <div>
              <label htmlFor="clientLimit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Client Limit
              </label>
              <select
                id="clientLimit"
                name="clientLimit"
                value={formData.limits.clients === Infinity ? 'unlimited' : formData.limits.clients.toString()}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              >
                <option value="5">5 clients</option>
                <option value="10">10 clients</option>
                <option value="15">15 clients</option>
                <option value="25">25 clients</option>
                <option value="50">50 clients</option>
                <option value="100">100 clients</option>
                <option value="unlimited">Unlimited clients</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="visitorLimit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Monthly Visitor Limit
              </label>
              <select
                id="visitorLimit"
                name="visitorLimit"
                value={formData.limits.visitors === Infinity ? 'unlimited' : (formData.limits.visitors / 1000).toString()}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              >
                <option value="10">10K visitors</option>
                <option value="50">50K visitors</option>
                <option value="100">100K visitors</option>
                <option value="250">250K visitors</option>
                <option value="500">500K visitors</option>
                <option value="1000">1M visitors</option>
                <option value="unlimited">Unlimited visitors</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Plan Features
            </label>
             <div className="space-y-2">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    placeholder={`Feature ${index + 1}`}
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFeature(index)}
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addFeature}
              >
                Add Feature
              </Button>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              leftIcon={<Save className="h-4 w-4" />}
            >
              {plan.id ? 'Update Plan' : 'Create Plan'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SuperAdminBillingPage;
