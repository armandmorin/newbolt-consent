import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Mail, Edit, Trash2, AlertCircle, Shield, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Layout from '../components/layout/Layout';
import { getAdmins, deleteAdmin } from '../lib/admins';
import { User } from '../types';
import { formatDate, getInitials } from '../lib/utils';
import { useNotification } from '../context/NotificationContext';

const AdminsPage: React.FC = () => {
  const { showNotification } = useNotification();
  const [admins, setAdmins] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const loadAdmins = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const adminsData = await getAdmins();
      setAdmins(adminsData);
    } catch (error: any) {
      console.error('Failed to load admins:', error);
      setError(error?.message || 'Failed to load admin users. Please try again.');
      showNotification('error', 'Error', 'Failed to load admin users');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    loadAdmins();
  }, []);
  
  const handleDeleteAdmin = async (adminId: string) => {
    if (window.confirm('Are you sure you want to delete this admin? This action cannot be undone.')) {
      try {
        await deleteAdmin(adminId);
        setAdmins(admins.filter(admin => admin.id !== adminId));
        showNotification('success', 'Admin Deleted', 'The admin has been successfully deleted.');
      } catch (error: any) {
        console.error('Failed to delete admin:', error);
        setError(error?.message || 'Failed to delete admin. Please try again.');
        showNotification('error', 'Error', 'Failed to delete admin');
      }
    }
  };
  
  const handleRefresh = async () => {
    try {
      await loadAdmins();
      showNotification('success', 'Data Refreshed', 'Admin list has been refreshed successfully.');
    } catch (error: any) {
      console.error('Failed to refresh admins:', error);
      showNotification('error', 'Error', 'Failed to refresh admin list');
    }
  };
  
  const filteredAdmins = admins.filter(admin => 
    admin.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    admin.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <Layout requiredRoles={['superadmin']}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Management</h1>
            <p className="text-gray-500 dark:text-gray-400">Manage admin users and their permissions</p>
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
            
            <Link to="/admins/new">
              <Button leftIcon={<Plus className="h-4 w-4" />}>
                Add Admin
              </Button>
            </Link>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                All Admins
              </CardTitle>
              <div className="w-full md:w-64">
                <Input
                  placeholder="Search admins..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="h-4 w-4" />}
                  fullWidth
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 p-3 rounded-md flex items-start mb-4 dark:bg-red-900/30">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 dark:text-red-400" />
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
              </div>
            ) : filteredAdmins.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:text-gray-300 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3">Admin</th>
                      <th className="px-6 py-3">Email</th>
                      <th className="px-6 py-3">Role</th>
                      <th className="px-6 py-3">Created</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAdmins.map((admin) => (
                      <tr key={admin.id} className="bg-white border-b hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600">
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-medium mr-3 dark:bg-blue-800 dark:text-blue-100">
                              {getInitials(admin.name)}
                            </div>
                            <span>{admin.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 text-gray-400 mr-2 dark:text-gray-500" />
                            {admin.email}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 capitalize dark:bg-blue-900/30 dark:text-blue-300">
                            {admin.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {formatDate(admin.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                            Active
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <Link to={`/admins/${admin.id}/edit`}>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              leftIcon={<Edit className="h-4 w-4" />}
                            >
                              Edit
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            leftIcon={<Trash2 className="h-4 w-4 text-red-500" />}
                            onClick={() => handleDeleteAdmin(admin.id)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  {searchQuery ? 'No admins match your search.' : 'No admin users found. Add your first admin to get started.'}
                </p>
                {searchQuery && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => setSearchQuery('')}
                  >
                    Clear search
                  </Button>
                )}
                {!searchQuery && (
                  <div className="mt-4">
                    <Link to="/admins/new">
                      <Button>
                        Add Your First Admin
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminsPage;
