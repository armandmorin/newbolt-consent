import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Filter, Download, RefreshCw, Activity, User, Clock, Globe, Info, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Layout from '../components/layout/Layout';
import { getUserActivityLog } from '../lib/auth';
import { formatDate } from '../lib/utils';
import Tooltip from '../components/ui/Tooltip';
import { useNotification } from '../context/NotificationContext';

const ActivityLogPage: React.FC = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(true);
  const [activityLog, setActivityLog] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days ago
    end: new Date().toISOString().split('T')[0], // today
  });
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadActivityLog = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const log = await getUserActivityLog();
        
        // Filter by date range
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        endDate.setHours(23, 59, 59, 999); // End of day
        
        const filteredLog = log.filter(entry => {
          const entryDate = new Date(entry.timestamp);
          return entryDate >= startDate && entryDate <= endDate;
        });
        
        setActivityLog(filteredLog);
      } catch (error: any) {
        console.error('Failed to load activity log:', error);
        setError(error?.message || 'Failed to load activity log. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadActivityLog();
  }, [dateRange]);
  
  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const log = await getUserActivityLog();
      
      // Filter by date range
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999); // End of day
      
      const filteredLog = log.filter(entry => {
        const entryDate = new Date(entry.timestamp);
        return entryDate >= startDate && entryDate <= endDate;
      });
      
      setActivityLog(filteredLog);
      showNotification('success', 'Data Refreshed', 'Activity log has been refreshed successfully.');
    } catch (error: any) {
      console.error('Failed to refresh activity log:', error);
      setError(error?.message || 'Failed to refresh activity log. Please try again.');
      showNotification('error', 'Error', 'Failed to refresh activity log');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleExportData = () => {
    try {
      // Create CSV content
      const csvContent = [
        'Timestamp,User ID,Action,IP Address,User Agent,Details',
        ...activityLog.map(item => {
          const details = item.details ? JSON.stringify(item.details).replace(/"/g, '""') : '';
          return `"${item.timestamp}","${item.user_id}","${item.action}","${item.ip_address}","${item.user_agent}","${details}"`;
        })
      ].join('\n');
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `activity-log-${dateRange.start}-to-${dateRange.end}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showNotification('success', 'Export Complete', 'Activity log has been exported successfully.');
    } catch (error: any) {
      console.error('Failed to export activity log:', error);
      showNotification('error', 'Export Failed', error?.message || 'Failed to export activity log');
    }
  };
  
  // Format timestamp to readable date and time
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  // Get action color based on action type
  const getActionColor = (action: string) => {
    switch (action) {
      case 'login':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'logout':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'create_client':
      case 'create_admin':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'update_client':
      case 'update_admin':
      case 'update_consent_settings':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'delete_client':
      case 'delete_admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };
  
  // Filter activities by action type
  const filteredActivities = actionFilter === 'all' 
    ? activityLog 
    : activityLog.filter(activity => activity.action.includes(actionFilter));
  
  // Get unique action types for filter dropdown
  const actionTypes = ['all', ...new Set(activityLog.map(activity => activity.action))];
  
  return (
    <Layout requiredRoles={['superadmin']}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Activity Log</h1>
            <p className="text-gray-500 dark:text-gray-400">Track user activity and system events</p>
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
              disabled={!filteredActivities.length || isLoading}
            >
              Export
            </Button>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                Activity History
              </CardTitle>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex items-center">
                  <Input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    leftIcon={<Calendar className="h-4 w-4" />}
                    aria-label="Start date"
                  />
                </div>
                <span className="self-center">to</span>
                <div className="flex items-center">
                  <Input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    leftIcon={<Calendar className="h-4 w-4" />}
                    aria-label="End date"
                  />
                </div>
                <select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  aria-label="Filter by action type"
                >
                  {actionTypes.map(action => (
                    <option key={action} value={action}>
                      {action === 'all' ? 'All Actions' : action.replace('_', ' ')}
                    </option>
                  ))}
                </select>
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
          <CardContent>
            {error && (
              <div className="bg-red-50 p-4 rounded-md flex items-start mb-4 dark:bg-red-900/30">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 dark:text-red-400" />
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
              </div>
            ) : filteredActivities.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:text-gray-300 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3">Timestamp</th>
                      <th className="px-6 py-3">User ID</th>
                      <th className="px-6 py-3">Action</th>
                      <th className="px-6 py-3">IP Address</th>
                      <th className="px-6 py-3">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredActivities.map((activity, index) => (
                      <tr key={index} className="bg-white border-b hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 text-gray-400 mr-2 dark:text-gray-500" />
                            {formatTimestamp(activity.timestamp || activity.created_at)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-gray-400 mr-2 dark:text-gray-500" />
                            {activity.user_id || activity.userId}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getActionColor(activity.action)}`}>
                            {activity.action.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <Globe className="h-4 w-4 text-gray-400 mr-2 dark:text-gray-500" />
                            {activity.ip_address || activity.ipAddress || '127.0.0.1'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {(activity.details && Object.keys(activity.details).length > 0) ? (
                            <Tooltip content={
                              <div className="space-y-1">
                                {Object.entries(activity.details).map(([key, value]) => (
                                  <div key={key}>
                                    <span className="font-medium">{key}:</span> {JSON.stringify(value)}
                                  </div>
                                ))}
                              </div>
                            }>
                              <button className="flex items-center text-blue-600 hover:underline dark:text-blue-400">
                                <Info className="h-4 w-4 mr-1" />
                                View Details
                              </button>
                            </Tooltip>
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400">No details</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No activity logs found for the selected date range and filters.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ActivityLogPage;
