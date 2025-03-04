import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, AlertCircle, Globe, Server, Code } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Layout from '../components/layout/Layout';
import { useNotification } from '../context/NotificationContext';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

const domainSchema = z.object({
  rootDomain: z.string().url('Please enter a valid URL'),
  apiEndpoint: z.string().url('Please enter a valid URL'),
  cdnDomain: z.string().url('Please enter a valid URL').optional(),
});

type DomainFormValues = z.infer<typeof domainSchema>;

const DomainSettingsPage: React.FC = () => {
  const { showNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
  } = useForm<DomainFormValues>({
    resolver: zodResolver(domainSchema),
    defaultValues: {
      rootDomain: 'https://consenthub.io',
      apiEndpoint: 'https://api.consenthub.io',
      cdnDomain: 'https://cdn.consenthub.io',
    },
  });
  
  // Watch form values for live preview
  const formValues = watch();
  
  useEffect(() => {
    const loadDomainSettings = async () => {
      try {
        setIsLoading(true);
        
        // In a real implementation, this would fetch from the database
        // For demo purposes, we'll check localStorage
        const storedSettings = localStorage.getItem('domain_settings');
        if (storedSettings) {
          const parsedSettings = JSON.parse(storedSettings);
          reset(parsedSettings);
        }
      } catch (error) {
        console.error('Failed to load domain settings:', error);
        setError('Failed to load domain settings. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDomainSettings();
  }, [reset]);
  
  const onSubmit = async (data: DomainFormValues) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // In a real implementation, this would save to the database
      // For demo purposes, we'll save to localStorage
      localStorage.setItem('domain_settings', JSON.stringify(data));
      
      setSuccess('Domain settings updated successfully!');
      showNotification('success', 'Settings Updated', 'Your domain settings have been saved successfully.');
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error: any) {
      console.error('Failed to update domain settings:', error);
      setError(error.message || 'Failed to update domain settings. Please try again.');
      showNotification('error', 'Update Failed', 'There was a problem saving your domain settings.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const generateSnippet = (clientId: string, adminId: string): string => {
    return `<script>
  (function() {
    var script = document.createElement('script');
    script.async = true;
    script.src = '${formValues.rootDomain}/api/snippet/${adminId}/${clientId}.js';
    var firstScript = document.getElementsByTagName('script')[0];
    firstScript.parentNode.insertBefore(script, firstScript);
  })();
</script>`;
  };
  
  return (
    <Layout requiredRoles={['superadmin']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Domain Settings</h1>
          <p className="text-gray-500 dark:text-gray-400">Configure the root domain and endpoints for the application</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                  Domain Configuration
                </CardTitle>
                <CardDescription>
                  These settings will be used for all client-facing URLs and API endpoints
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  {error && (
                    <div className="bg-red-50 p-3 rounded-md flex items-start dark:bg-red-900/30">
                      <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 dark:text-red-400" />
                      <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                    </div>
                  )}
                  
                  {success && (
                    <div className="bg-green-50 p-3 rounded-md flex items-start dark:bg-green-900/30">
                      <AlertCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 dark:text-green-400" />
                      <p className="text-sm text-green-700 dark:text-green-300">{success}</p>
                    </div>
                  )}
                  
                  <Input
                    label="Root Domain"
                    placeholder="https://consenthub.io"
                    leftIcon={<Globe className="h-4 w-4" />}
                    error={errors.rootDomain?.message}
                    fullWidth
                    {...register('rootDomain')}
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 -mt-2">
                    The main domain for your application. This will be used for all client-facing URLs.
                  </p>
                  
                  <Input
                    label="API Endpoint"
                    placeholder="https://api.consenthub.io"
                    leftIcon={<Server className="h-4 w-4" />}
                    error={errors.apiEndpoint?.message}
                    fullWidth
                    {...register('apiEndpoint')}
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 -mt-2">
                    The endpoint for API requests. This will be used for all backend communication.
                  </p>
                  
                  <Input
                    label="CDN Domain (Optional)"
                    placeholder="https://cdn.consenthub.io"
                    leftIcon={<Server className="h-4 w-4" />}
                    error={errors.cdnDomain?.message}
                    fullWidth
                    {...register('cdnDomain')}
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 -mt-2">
                    Optional CDN domain for static assets. If not provided, the root domain will be used.
                  </p>
                  
                  <div className="bg-blue-50 p-4 rounded-md dark:bg-blue-900/20">
                    <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">Domain Configuration Impact</h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Changing these settings will affect all client-facing URLs and API endpoints. Make sure to update
                      any DNS records and server configurations accordingly.
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button
                    type="submit"
                    leftIcon={<Save className="h-4 w-4" />}
                    isLoading={isLoading}
                    disabled={!isDirty}
                  >
                    Save Domain Settings
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Code className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                  Integration Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Client Snippet</h3>
                  <div className="rounded-md overflow-hidden">
                    <SyntaxHighlighter
                      language="javascript"
                      style={tomorrow}
                      customStyle={{
                        margin: 0,
                        padding: '1rem',
                        borderRadius: '0.375rem',
                        fontSize: '0.8rem',
                      }}
                    >
                      {generateSnippet('client_123', 'admin_456')}
                    </SyntaxHighlighter>
                  </div>
                  
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-4">API Endpoint</h3>
                  <div className="rounded-md overflow-hidden">
                    <SyntaxHighlighter
                      language="javascript"
                      style={tomorrow}
                      customStyle={{
                        margin: 0,
                        padding: '1rem',
                        borderRadius: '0.375rem',
                        fontSize: '0.8rem',
                      }}
                    >
                      {`${formValues.apiEndpoint}/v1/consent`}
                    </SyntaxHighlighter>
                  </div>
                  
                  <div className="mt-4 p-3 bg-yellow-50 rounded-md dark:bg-yellow-900/20">
                    <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Important Note</h3>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                      After changing domain settings, all client integration snippets will need to be updated.
                      Consider sending an email notification to all admins.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DomainSettingsPage;
