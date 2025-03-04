import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell
} from 'recharts';
import { Calendar, Filter, Download, RefreshCw, Users, Globe, ExternalLink, TrendingUp, Award, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Layout from '../components/layout/Layout';
import { getAnalytics, getTopAdmins, getTopClients } from '../lib/analytics';
import { ConsentAnalytics, AdminUsage, ClientUsage } from '../types';
import { getCurrentUser } from '../lib/auth';
import { useNotification } from '../context/NotificationContext';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const AnalyticsPage: React.FC = () => {
  const { showNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<ConsentAnalytics | null>(null);
  const [topAdmins, setTopAdmins] = useState<AdminUsage[]>([]);
  const [topClients, setTopClients] = useState<ClientUsage[]>([]);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    end: new Date().toISOString().split('T')[0], // today
  });
  const [userRole, setUserRole] = useState<string | null>(null);
  
  useEffect(() => {
    const loadUserRole = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          setUserRole(user.role);
        }
      } catch (error) {
        console.error('Error loading user role:', error);
      }
    };
    
    loadUserRole();
  }, []);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Load analytics data
        try {
          const analyticsData = await getAnalytics(dateRange.start, dateRange.end);
          setAnalytics(analyticsData);
        } catch (err) {
          console.error('Failed to load analytics data:', err);
          // Continue with other data loading
        }
        
        // Load top admins (only for superadmin)
        if (userRole === 'superadmin') {
          try {
            const adminsData = await getTopAdmins(10);
            setTopAdmins(adminsData);
          } catch (err) {
            console.error('Failed to load top admins:', err);
            // Continue with other data loading
          }
        }
        
        // Load top clients
        try {
          const clientsData = await getTopClients(10);
          setTopClients(clientsData);
        } catch (err) {
          console.error('Failed to load top clients:', err);
        }
      } catch (error: any) {
        console.error('Failed to load analytics data:', error);
        setError(error?.message || 'Failed to load analytics data. Please try refreshing the page.');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (userRole !== null) {
      loadData();
    }
  }, [dateRange, userRole]);
  
  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Reload analytics data
      try {
        const analyticsData = await getAnalytics(dateRange.start, dateRange.end);
        setAnalytics(analyticsData);
      } catch (err) {
        console.error('Failed to refresh analytics data:', err);
      }
      
      // Reload top admins (only for superadmin)
      if (userRole === 'superadmin') {
        try {
          const adminsData = await getTopAdmins(10);
          setTopAdmins(adminsData);
        } catch (err) {
          console.error('Failed to refresh top admins:', err);
        }
      }
      
      // Reload top clients
      try {
        const clientsData = await getTopClients(10);
        setTopClients(clientsData);
      } catch (err) {
        console.error('Failed to refresh top clients:', err);
      }
      
      showNotification('success', 'Data Refreshed', 'Analytics data has been refreshed successfully.');
    } catch (error: any) {
      console.error('Failed to refresh analytics data:', error);
      setError(error?.message || 'Failed to refresh analytics data. Please try again.');
      showNotification('error', 'Error', 'Failed to refresh analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = () => {
    try {
      if (!analytics) return;
      
      // Create CSV content
      const csvContent = [
        'Date,Visitors,Consents,ConsentRate',
        ...analytics.timeData.map(item => 
          `${item.date},${item.visitors},${item.consents},${(item.consents / item.visitors * 100).toFixed(2)}%`
        )
      ].join('\n');
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `consent-analytics-${dateRange.start}-to-${dateRange.end}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showNotification('success', 'Export Complete', 'Analytics data has been exported successfully.');
    } catch (error: any) {
      console.error('Failed to export analytics data:', error);
      showNotification('error', 'Export Failed', error?.message || 'Failed to export analytics data');
    }
  };

  // Format large numbers with commas
  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
            <p className="text-gray-500 dark:text-gray-400">Track consent rates and user interactions</p>
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
              disabled={!analytics || isLoading}
            >
              Export
            </Button>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle>Date Range</CardTitle>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex items-center">
                  <Input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    leftIcon={<Calendar className="h-4 w-4" />}
                  />
                </div>
                <span className="self-center">to</span>
                <div className="flex items-center">
                  <Input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    leftIcon={<Calendar className="h-4 w-4" />}
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Filter className="h-4 w-4" />}
                  onClick={handleRefresh}
                >
                  Apply
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
        
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
        ) : analytics ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Visitors</p>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{formatNumber(analytics.totalVisitors)}</h3>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Consent Rate</p>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{analytics.consentRate}%</h3>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Interaction Rate</p>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{analytics.interactionRate}%</h3>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Analytics Acceptance</p>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                      {Math.round((analytics.categoryBreakdown.analytics / analytics.categoryBreakdown.necessary) * 100)}%
                    </h3>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Visitor Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                  Visitor Trend
                </CardTitle>
                <CardDescription>
                  Daily visitors and consent rates over the selected period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={analytics.timeData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="visitors" stroke="#3b82f6" name="Visitors" />
                      <Line type="monotone" dataKey="consents" stroke="#10b981" name="Consents" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Top Admins and Clients */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Admins (SuperAdmin only) */}
              {userRole === 'superadmin' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                      Top 10 Admins by Usage
                    </CardTitle>
                    <CardDescription>
                      Admins with the highest visitor counts
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {topAdmins.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:text-gray-300 dark:bg-gray-800">
                            <tr>
                              <th className="px-4 py-3">Admin</th>
                              <th className="px-4 py-3 text-right">Visitors</th>
                              <th className="px-4 py-3 text-right">Clients</th>
                              <th className="px-4 py-3 text-right">Consent Rate</th>
                            </tr>
                          </thead>
                          <tbody>
                            {topAdmins.map((admin) => (
                              <tr key={admin.id} className="bg-white border-b hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600">
                                <td className="px-4 py-3">
                                  <div>
                                    <div className="font-medium text-gray-900 dark:text-white">{admin.name}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">{admin.email}</div>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-right font-medium">{formatNumber(admin.totalVisitors)}</td>
                                <td className="px-4 py-3 text-right">{admin.clientCount}</td>
                                <td className="px-4 py-3 text-right">
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    admin.consentRate >= 80 
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                                      : admin.consentRate >= 70 
                                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                  }`}>
                                    {admin.consentRate}%
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-gray-500 dark:text-gray-400">No admin data available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
              
              {/* Top Clients */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                    Top 10 Clients by Usage
                  </CardTitle>
                  <CardDescription>
                    Clients with the highest visitor counts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {topClients.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:text-gray-300 dark:bg-gray-800">
                          <tr>
                            <th className="px-4 py-3">Client</th>
                            <th className="px-4 py-3">Website</th>
                            <th className="px-4 py-3 text-right">Visitors</th>
                            <th className="px-4 py-3 text-right">Consent Rate</th>
                          </tr>
                        </thead>
                        <tbody>
                          {topClients.map((client) => (
                            <tr key={client.id} className="bg-white border-b hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600">
                              <td className="px-4 py-3">
                                <div>
                                  <div className="font-medium text-gray-900 dark:text-white">{client.name}</div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">Admin: {client.adminName}</div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <a 
                                  href={client.website.startsWith('http') ? client.website : `https://${client.website}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center text-blue-600 hover:underline dark:text-blue-400"
                                >
                                  {client.website}
                                  <ExternalLink className="h-3 w-3 ml-1" />
                                </a>
                              </td>
                              <td className="px-4 py-3 text-right font-medium">{formatNumber(client.totalVisitors)}</td>
                              <td className="px-4 py-3 text-right">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  client.consentRate >= 80 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                                    : client.consentRate >= 70 
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                }`}>
                                  {client.consentRate}%
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-500 dark:text-gray-400">No client data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Geographic Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                  Geographic Distribution
                </CardTitle>
                <CardDescription>
                  Visitor distribution by country
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {analytics.geographicData && Object.keys(analytics.geographicData).length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={Object.entries(analytics.geographicData).map(([country, count]) => ({ country, count }))}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="country" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" name="Visitors" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500 dark:text-gray-400">No geographic data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No analytics data available for the selected date range.</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={handleRefresh}
            >
              Refresh Data
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AnalyticsPage;
