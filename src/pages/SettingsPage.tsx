import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, AlertCircle, Palette, Image, AtSign, CreditCard, Eye, EyeOff } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import FileUpload from '../components/ui/FileUpload';
import Layout from '../components/layout/Layout';
import { getCurrentUser } from '../lib/auth';
import { getBrandingSettings, updateBrandingSettings } from '../lib/branding';
import { BrandingSettings } from '../types';
import { useNotification } from '../context/NotificationContext';

const brandingSchema = z.object({
  headerColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please enter a valid hex color'),
  linkColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please enter a valid hex color'),
  buttonColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please enter a valid hex color'),
  buttonTextColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please enter a valid hex color'),
  logo: z.string().optional(),
  poweredBy: z.string().optional(),
});

type BrandingFormValues = z.infer<typeof brandingSchema>;

const stripeSchema = z.object({
  publishableKey: z.string().min(1, 'Publishable key is required'),
  secretKey: z.string().min(1, 'Secret key is required'),
});

type StripeFormValues = z.infer<typeof stripeSchema>;

const SettingsPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const { showNotification } = useNotification();
  const [activeTab, setActiveTab] = useState<'branding' | 'stripe'>('branding');
  const [showSecretKey, setShowSecretKey] = useState(false);
  
  const {
    register: registerBranding,
    handleSubmit: handleSubmitBranding,
    formState: { errors: brandingErrors, isDirty: isBrandingDirty },
    reset: resetBranding,
    watch: watchBranding,
    setValue: setBrandingValue,
  } = useForm<BrandingFormValues>({
    resolver: zodResolver(brandingSchema),
    defaultValues: {
      headerColor: '#1e40af',
      linkColor: '#3b82f6',
      buttonColor: '#2563eb',
      buttonTextColor: '#ffffff',
      logo: '',
      poweredBy: '@ConsentHub',
    },
  });
  
  const {
    register: registerStripe,
    handleSubmit: handleSubmitStripe,
    formState: { errors: stripeErrors, isDirty: isStripeDirty },
    reset: resetStripe,
  } = useForm<StripeFormValues>({
    resolver: zodResolver(stripeSchema),
    defaultValues: {
      publishableKey: '',
      secretKey: '',
    },
  });
  
  // Watch form values for live preview
  const formValues = watchBranding();
  
  useEffect(() => {
    const loadBrandingSettings = async () => {
      try {
        setIsLoading(true);
        const settings = await getBrandingSettings();
        console.log('Loaded branding settings:', settings);
        if (settings) {
          resetBranding(settings);
          if (settings.logo) {
            setLogoPreview(settings.logo);
          }
        }
        
        // Load Stripe keys from localStorage
        const stripeKeys = localStorage.getItem('stripe_keys');
        if (stripeKeys) {
          const parsedKeys = JSON.parse(stripeKeys);
          resetStripe({
            publishableKey: parsedKeys.publishableKey || '',
            secretKey: parsedKeys.secretKey || '',
          });
        }
      } catch (error) {
        console.error('Failed to load branding settings:', error);
        setError('Failed to load branding settings. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadBrandingSettings();
  }, [resetBranding, resetStripe]);
  
  const handleColorChange = (field: keyof BrandingFormValues, value: string) => {
    setBrandingValue(field, value, { 
      shouldValidate: true,
      shouldDirty: true 
    });
  };
  
  const handleLogoChange = (base64String: string | null) => {
    setBrandingValue('logo', base64String || '', { 
      shouldValidate: true,
      shouldDirty: true 
    });
    setLogoPreview(base64String);
  };
  
  const onSubmitBranding = async (data: BrandingFormValues) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      console.log('Submitting branding settings:', data);
      
      // Ensure all required fields are present
      const brandingData: BrandingSettings = {
        headerColor: data.headerColor,
        linkColor: data.linkColor,
        buttonColor: data.buttonColor,
        buttonTextColor: data.buttonTextColor,
        logo: data.logo || undefined,
        poweredBy: data.poweredBy
      };
      
      await updateBrandingSettings(brandingData);
      
      setSuccess('Branding settings updated successfully!');
      showNotification('success', 'Settings Updated', 'Your branding settings have been saved successfully.');
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error: any) {
      console.error('Failed to update branding settings:', error);
      setError(error.message || 'Failed to update branding settings. Please try again.');
      showNotification('error', 'Update Failed', 'There was a problem saving your branding settings.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const onSubmitStripe = async (data: StripeFormValues) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Save Stripe keys to localStorage
      localStorage.setItem('stripe_keys', JSON.stringify({
        publishableKey: data.publishableKey,
        secretKey: data.secretKey,
      }));
      
      setSuccess('Stripe API keys updated successfully!');
      showNotification('success', 'Settings Updated', 'Your Stripe API keys have been saved successfully.');
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error: any) {
      console.error('Failed to update Stripe API keys:', error);
      setError(error.message || 'Failed to update Stripe API keys. Please try again.');
      showNotification('error', 'Update Failed', 'There was a problem saving your Stripe API keys.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-500 dark:text-gray-400">Customize your application settings</p>
        </div>
        
        <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700">
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'branding' 
                ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400' 
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('branding')}
          >
            Branding
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'stripe' 
                ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400' 
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('stripe')}
          >
            Stripe Integration
          </button>
        </div>
        
        {activeTab === 'branding' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Palette className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                    Branding Customization
                  </CardTitle>
                </CardHeader>
                <form onSubmit={handleSubmitBranding(onSubmitBranding)}>
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
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Logo</h3>
                      
                      <FileUpload
                        label="Upload Logo"
                        accept="image/*"
                        value={logoPreview || undefined}
                        onChange={handleLogoChange}
                        maxSizeInMB={1}
                      />
                      
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Upload your logo image. For best results, use a PNG or SVG with a transparent background.
                        Maximum file size: 1MB.
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Colors</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <Input
                            label="Header Color"
                            type="color"
                            error={brandingErrors.headerColor?.message}
                            {...registerBranding('headerColor')}
                          />
                          <Input
                            type="text"
                            error={brandingErrors.headerColor?.message}
                            {...registerBranding('headerColor')}
                          />
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Input
                            label="Link Color"
                            type="color"
                            error={brandingErrors.linkColor?.message}
                            {...registerBranding('linkColor')}
                          />
                          <Input
                            type="text"
                            error={brandingErrors.linkColor?.message}
                            {...registerBranding('linkColor')}
                          />
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Input
                            label="Button Color"
                            type="color"
                            error={brandingErrors.buttonColor?.message}
                            {...registerBranding('buttonColor')}
                          />
                          <Input
                            type="text"
                            error={brandingErrors.buttonColor?.message}
                            {...registerBranding('buttonColor')}
                          />
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Input
                            label="Button Text Color"
                            type="color"
                            error={brandingErrors.buttonTextColor?.message}
                            {...registerBranding('buttonTextColor')}
                          />
                          <Input
                            type="text"
                            error={brandingErrors.buttonTextColor?.message}
                            {...registerBranding('buttonTextColor')}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Attribution</h3>
                      
                      <Input
                        label="Powered By"
                        placeholder="@ConsentHub"
                        leftIcon={<AtSign className="h-4 w-4" />}
                        error={brandingErrors.poweredBy?.message}
                        fullWidth
                        {...registerBranding('poweredBy')}
                      />
                      
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        This text will appear at the bottom of the consent widget. Leave empty to remove the attribution.
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button
                      type="submit"
                      leftIcon={<Save className="h-4 w-4" />}
                      isLoading={isLoading}
                      disabled={!isBrandingDirty}
                    >
                      Save Branding Settings
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="dark:text-white">Live Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div 
                      className="rounded-t-lg p-4 flex items-center"
                      style={{ backgroundColor: formValues.headerColor }}
                    >
                      {logoPreview ? (
                        <img 
                          src={logoPreview} 
                          alt="Logo" 
                          className="h-8 mr-2"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/80x30?text=Logo';
                          }}
                        />
                      ) : (
                        <div className="h-8 w-20 bg-white/20 rounded mr-2 flex items-center justify-center text-white text-xs">
                          Logo
                        </div>
                      )}
                      <h3 className="text-white font-medium">Cookie Consent</h3>
                    </div>
                    
                    <div className="p-4 border border-gray-200 rounded-b-lg dark:border-gray-700">
                      <p className="text-sm text-gray-700 mb-3 dark:text-gray-300">
                        We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies. 
                        <a 
                          href="#" 
                          className="ml-1"
                          style={{ color: formValues.linkColor }}
                        >
                          Learn more
                        </a>
                      </p>
                      
                      <div className="flex space-x-2">
                        <button 
                          className="px-4 py-2 rounded text-sm font-medium"
                          style={{ 
                            backgroundColor: formValues.buttonColor,
                            color: formValues.buttonTextColor
                          }}
                        >
                          Accept All
                        </button>
                        
                        <button 
                          className="px-4 py-2 rounded text-sm font-medium border border-gray-300 dark:border-gray-600 dark:text-white"
                        >
                          Reject All
                        </button>
                        
                        <button 
                          className="px-4 py-2 rounded text-sm font-medium border border-gray-300 dark:border-gray-600 dark:text-white"
                        >
                          Preferences
                        </button>
                      </div>
                      
                      {formValues.poweredBy && (
                        <div className="mt-4 text-center">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Powered By {formValues.poweredBy}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
        
        {activeTab === 'stripe' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                Stripe API Keys
              </CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmitStripe(onSubmitStripe)}>
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
                
                <div className="bg-blue-50 p-4 rounded-md mb-4 dark:bg-blue-900/20">
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">Stripe Integration</h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Enter your Stripe API keys to enable payment processing. You can find these in your 
                    <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" className="underline ml-1">
                      Stripe Dashboard
                    </a>.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <Input
                    label="Publishable Key"
                    placeholder="pk_test_..."
                    error={stripeErrors.publishableKey?.message}
                    fullWidth
                    {...registerStripe('publishableKey')}
                  />
                  
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="secretKey">
                      Secret Key
                    </label>
                    <div className="relative">
                      <input
                        id="secretKey"
                        type={showSecretKey ? "text" : "password"}
                        placeholder="sk_test_..."
                        className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 pr-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-500 ${stripeErrors.secretKey ? 'border-red-500 focus:ring-red-500' : ''}`}
                        {...registerStripe('secretKey')}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
                        <button 
                          type="button"
                          onClick={() => setShowSecretKey(!showSecretKey)}
                          className="focus:outline-none"
                          tabIndex={-1}
                          aria-label={showSecretKey ? "Hide secret key" : "Show secret key"}
                        >
                          {showSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    {stripeErrors.secretKey && <p className="text-sm text-red-500 dark:text-red-400">{stripeErrors.secretKey.message}</p>}
                  </div>
                  
                  <div className="bg-yellow-50 p-3 rounded-md dark:bg-yellow-900/20">
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      <strong>Important:</strong> In a production environment, never store your Stripe Secret Key in the browser. 
                      This implementation is for demonstration purposes only. In a real application, API keys should be stored securely on your server.
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button
                  type="submit"
                  leftIcon={<Save className="h-4 w-4" />}
                  isLoading={isLoading}
                  disabled={!isStripeDirty}
                >
                  Save Stripe Settings
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default SettingsPage;
