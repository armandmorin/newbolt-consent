import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, ExternalLink, Edit, Trash2, Settings, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Layout from '../components/layout/Layout';
import { getClients, deleteClient } from '../lib/clients';
import { Client } from '../types';
import { formatDate } from '../lib/utils';
import { useNotification } from '../context/NotificationContext';

const ClientsPage: React.FC = () => {
  const { showNotification } = useNotification();
  const [clients, setClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadClients = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const clientsData = await getClients();
        setClients(clientsData);
      } catch (error: any) {
        console.error('Failed to load clients:', error);
        setError(error?.message || 'Failed to load clients. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadClients();
  }, []);
  
  const handleDeleteClient = async (clientId: string) => {
    if (window.confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      try {
        await deleteClient(clientId);
        setClients(clients.filter(client => client.id !== clientId));
        showNotification('success', 'Client Deleted', 'The client has been successfully deleted.');
      } catch (error: any) {
        console.error('Failed to delete client:', error);
        showNotification('error', 'Error', error?.message || 'Failed to delete client. Please try again.');
      }
    }
  };
  
  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const clientsData = await getClients();
      setClients(clientsData);
      showNotification('success', 'Data Refreshed', 'Client list has been refreshed successfully.');
    } catch (error: any) {
      console.error('Failed to refresh clients:', error);
      setError(error?.message || 'Failed to refresh clients. Please try again.');
      showNotification('error', 'Error', 'Failed to refresh clients');
    } finally {
      setIsLoading(false);
    }
  };
  
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    client.website.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Clients</h1>
            <p className="text-gray-500 dark:text-gray-400">Manage your client websites and consent settings</p>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              isLoading={isLoading}
            >
              Refresh
            </Button>
            
            <Link to="/clients/new">
              <Button leftIcon={<Plus className="h-4 w-4" />}>
                Add Client
              </Button>
            </Link>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle>All Clients</CardTitle>
              <div className="w-full md:w-64">
                <Input
                  placeholder="Search clients..."
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
              <div className="bg-red-50 p-4 rounded-md flex items-start mb-4 dark:bg-red-900/30">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 dark:text-red-400" />
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
              </div>
            ) : filteredClients.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:text-gray-300 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3">Name</th>
                      <th className="px-6 py-3">Website</th>
                      <th className="px-6 py-3">Created</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClients.map((client) => (
                      <tr key={client.id} className="bg-white border-b hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600">
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                          {client.name}
                        </td>
                        <td className="px-6 py-4">
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
                        <td className="px-6 py-4">
                          {formatDate(client.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                            Active
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <Link to={`/clients/${client.id}/consent`}>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              leftIcon={<Settings className="h-4 w-4" />}
                            >
                              Consent
                            </Button>
                          </Link>
                          <Link to={`/clients/${client.id}/snippet`}>
                            <Button variant="ghost" size="sm">
                              Get Code
                            </Button>
                          </Link>
                          <Link to={`/clients/${client.id}/edit`}>
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
                            onClick={() => handleDeleteClient(client.id)}
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
                  {searchQuery ? 'No clients match your search.' : 'No clients found. Add your first client to get started.'}
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
                    <Link to="/clients/new">
                      <Button>
                        Add Your First Client
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

export default ClientsPage;
