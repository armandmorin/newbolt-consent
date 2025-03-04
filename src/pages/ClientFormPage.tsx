import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Globe, Building, Save, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Layout from '../components/layout/Layout';
import { createClient, getClient, updateClient } from '../lib/clients';
import { ConsentSettings } from '../types';

const clientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  website: z.string().url('Please enter a valid URL (include http:// or https://)'),
});

type ClientFormValues = z.infer<typeof clientSchema>;

const ClientFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: '',
      website: '',
    },
  });
  
  useEffect(() => {
    if (isEditMode && id) {
      const loadClient = async () => {
        try {
          setIsLoading(true);
          const client = await getClient(id);
          reset({
            name: client.name,
            website: client.website,
          });
        } catch (error) {
          console.error('Failed to load client:', error);
          setError('Failed to load client details. Please try again.');
        } finally {
          setIsLoading(false);
        }
      };
      
      loadClient();
    }
  }, [isEditMode, id, reset]);
  
  const onSubmit = async (data: ClientFormValues) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Default consent settings for new clients
      const defaultConsentSettings: ConsentSettings = {
        position: 'bottom',
        categories: {
          necessary: true,
          analytics: true,
          marketing: false,
          preferences: false,
        },
        languages: ['en'],
        defaultLanguage: 'en',
      };
      
      if (isEditMode && id) {
        await updateClient(id, {
          name: data.name,
          website: data.website,
        });
      } else {
        await createClient({
          name: data.name,
          website: data.website,
          consentSettings: defaultConsentSettings,
        });
      }
      
      navigate('/clients');
    } catch (error) {
      console.error('Failed to save client:', error);
      setError('Failed to save client. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            onClick={() => navigate('/clients')}
          >
            Back to Clients
          </Button>
        </div>
        
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? 'Edit Client' : 'Add New Client'}
          </h1>
          <p className="text-gray-500">
            {isEditMode
              ? 'Update client information and consent settings'
              : 'Add a new client to manage their consent popup'}
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-red-50 p-3 rounded-md flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
              
              <Input
                label="Client Name"
                placeholder="Enter client name"
                leftIcon={<Building className="h-4 w-4" />}
                error={errors.name?.message}
                fullWidth
                {...register('name')}
              />
              
              <Input
                label="Website URL"
                placeholder="https://example.com"
                leftIcon={<Globe className="h-4 w-4" />}
                error={errors.website?.message}
                fullWidth
                {...register('website')}
              />
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                type="submit"
                leftIcon={<Save className="h-4 w-4" />}
                isLoading={isLoading}
              >
                {isEditMode ? 'Update Client' : 'Create Client'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default ClientFormPage;
