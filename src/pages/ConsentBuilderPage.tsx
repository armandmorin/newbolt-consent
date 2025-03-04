import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, AlertCircle, Globe, Check, X, Play, Download, Upload, Code } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Layout from '../components/layout/Layout';
import { getClient, updateClientConsentSettings } from '../lib/clients';
import { getBrandingSettings } from '../lib/branding';
import { ConsentSettings, BrandingSettings } from '../types';
import ConsentPreview from '../components/consent/ConsentPreview';
import { useNotification } from '../context/NotificationContext';
import Tooltip from '../components/ui/Tooltip';

const consentSchema = z.object({
  position: z.enum(['bottom', 'top', 'modal']),
  categories: z.object({
    necessary: z.boolean(),
    analytics: z.boolean(),
    marketing: z.boolean(),
    preferences: z.boolean(),
  }),
  languages: z.array(z.string()),
  defaultLanguage: z.string(),
  customText: z.record(z.string()).optional(),
});

type ConsentFormValues = z.infer<typeof consentSchema>;

const ConsentBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showNotification } = useNotification();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientName, setClientName] = useState('');
  const [brandingSettings, setBrandingSettings] = useState<BrandingSettings | null>(null);
  const [isTestMode, setIsTestMode] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
    setValue,
    getValues,
  } = useForm<ConsentFormValues>({
    resolver: zodResolver(consentSchema),
    defaultValues: {
      position: 'bottom',
      categories: {
        necessary: true,
        analytics: true,
        marketing: false,
        preferences: false,
      },
      languages: ['en'],
      defaultLanguage: 'en',
      customText: {},
    },
  });
  
  // Watch form values for live preview
  const formValues = watch();
  
  useEffect(() => {
    if (id) {
      const loadData = async () => {
        try {
          setIsLoading(true);
          
          // Load client data
          const client = await getClient(id);
          setClientName(client.name);
          
          // Load consent settings
          if (client.consentSettings) {
            reset(client.consentSettings);
          }
          
          // Load branding settings
          const branding = await getBrandingSettings();
          console.log('Loaded branding settings for preview:', branding);
          setBrandingSettings(branding);
        } catch (error) {
          console.error('Failed to load data:', error);
          setError('Failed to load client data. Please try again.');
        } finally {
          setIsLoading(false);
        }
      };
      
      loadData();
    }
  }, [id, reset]);
  
  const onSubmit = async (data: ConsentFormValues) => {
    if (!id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await updateClientConsentSettings(id, data);
      showNotification('success', 'Settings Saved', 'Consent settings have been updated successfully.');
      
      // Reset the form's dirty state by re-setting the values
      reset(data);
    } catch (error) {
      console.error('Failed to update consent settings:', error);
      setError('Failed to update consent settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleCategory = (category: keyof ConsentFormValues['categories']) => {
    setValue(`categories.${category}`, !formValues.categories[category], { 
      shouldDirty: true,
      shouldValidate: true 
    });
  };
  
  const handleTestMode = () => {
    setIsTestMode(!isTestMode);
  };
  
  const handleExportConfig = () => {
    const config = getValues();
    const configJson = JSON.stringify(config, null, 2);
    
    // Create download link
    const blob = new Blob([configJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `consent-config-${id}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('success', 'Config Exported', 'Consent configuration has been exported successfully.');
  };
  
  const handleImportConfig = () => {
    setShowImportModal(true);
    setImportData('');
    setImportError(null);
  };
  
  const processImport = () => {
    try {
      const parsedData = JSON.parse(importData);
      
      // Validate the imported data
      const result = consentSchema.safeParse(parsedData);
      
      if (!result.success) {
        setImportError('Invalid configuration format. Please check your JSON data.');
        return;
      }
      
      // Update form with imported data
      reset(parsedData);
      setShowImportModal(false);
      showNotification('success', 'Config Imported', 'Consent configuration has been imported successfully.');
    } catch (error) {
      setImportError('Failed to parse JSON data. Please check your format.');
    }
  };
  
  const generateCodeSnippet = () => {
    if (!id) return '';
    
    return `<script>
  (function() {
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://consenthub.io/api/snippet/${id}.js';
    var firstScript = document.getElementsByTagName('script')[0];
    firstScript.parentNode.insertBefore(script, firstScript);
  })();
</script>`;
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
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Consent Popup Builder
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              {isLoading ? 'Loading...' : `Customize the consent popup for ${clientName}`}
            </p>
          </div>
          
          <div className="flex space-x-2">
            <Tooltip content="Test your consent popup configuration">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Play className="h-4 w-4" />}
                onClick={handleTestMode}
              >
                {isTestMode ? 'Exit Test Mode' : 'Test Mode'}
              </Button>
            </Tooltip>
            
            <Tooltip content="Export your consent configuration as JSON">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Download className="h-4 w-4" />}
                onClick={handleExportConfig}
              >
                Export Config
              </Button>
            </Tooltip>
            
            <Tooltip content="Import a consent configuration from JSON">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Upload className="h-4 w-4" />}
                onClick={handleImportConfig}
              >
                Import Config
              </Button>
            </Tooltip>
            
            <Tooltip content="View integration code">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Code className="h-4 w-4" />}
                onClick={() => navigate(`/clients/${id}/snippet`)}
              >
                Get Code
              </Button>
            </Tooltip>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                  Consent Settings
                </CardTitle>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-6">
                  {error && (
                    <div className="bg-red-50 p-3 rounded-md flex items-start dark:bg-red-900/30">
                      <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 dark:text-red-400" />
                      <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Position</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <label className={`flex items-center space-x-2 p-4 border rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${formValues.position === 'bottom' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'dark:border-gray-700'}`}>
                        <input
                          type="radio"
                          value="bottom"
                          {...register('position')}
                          className="h-4 w-4 text-blue-600"
                        />
                        <span className="dark:text-white">Bottom Banner</span>
                      </label>
                      
                      <label className={`flex items-center space-x-2 p-4 border rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${formValues.position === 'top' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'dark:border-gray-700'}`}>
                        <input
                          type="radio"
                          value="top"
                          {...register('position')}
                          className="h-4 w-4 text-blue-600"
                        />
                        <span className="dark:text-white">Top Banner</span>
                      </label>
                      
                      <label className={`flex items-center space-x-2 p-4 border rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${formValues.position === 'modal' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'dark:border-gray-700'}`}>
                        <input
                          type="radio"
                          value="modal"
                          {...register('position')}
                          className="h-4 w-4 text-blue-600"
                        />
                        <span className="dark:text-white">Center Modal</span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Cookie Categories</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Select which cookie categories to include in the consent popup.
                      Note: Necessary cookies are always required and cannot be disabled.
                    </p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded-md bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                        <div>
                          <h4 className="font-medium dark:text-white">Necessary</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Essential for the website to function properly</p>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            {...register('categories.necessary')}
                            className="h-4 w-4 text-blue-600"
                            checked
                            disabled
                            aria-disabled="true"
                          />
                        </div>
                      </div>
                      
                      <div 
                        className={`flex items-center justify-between p-3 border rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${formValues.categories.analytics ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'dark:border-gray-700'}`}
                        onClick={() => toggleCategory('analytics')}
                      >
                        <div>
                          <h4 className="font-medium dark:text-white">Analytics</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Help understand how visitors interact with the website</p>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="analytics-checkbox"
                            {...register('categories.analytics')}
                            className="h-4 w-4 text-blue-600"
                            aria-checked={formValues.categories.analytics}
                          />
                        </div>
                      </div>
                      
                      <div 
                        className={`flex items-center justify-between p-3 border rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${formValues.categories.marketing ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'dark:border-gray-700'}`}
                        onClick={() => toggleCategory('marketing')}
                      >
                        <div>
                          <h4 className="font-medium dark:text-white">Marketing</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Used for advertising and personalized content</p>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="marketing-checkbox"
                            {...register('categories.marketing')}
                            className="h-4 w-4 text-blue-600"
                            aria-checked={formValues.categories.marketing}
                          />
                        </div>
                      </div>
                      
                      <div 
                        className={`flex items-center justify-between p-3 border rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${formValues.categories.preferences ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'dark:border-gray-700'}`}
                        onClick={() => toggleCategory('preferences')}
                      >
                        <div>
                          <h4 className="font-medium dark:text-white">Preferences</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Remember settings to enhance your experience</p>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="preferences-checkbox"
                            {...register('categories.preferences')}
                            className="h-4 w-4 text-blue-600"
                            aria-checked={formValues.categories.preferences}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Language Settings</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="default-language">
                        Default Language
                      </label>
                      <select
                        id="default-language"
                        {...register('defaultLanguage')}
                        className="w-full rounded-md border border-gray-300 p-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        aria-label="Select default language"
                      >
                        <option value="en">English</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                        <option value="es">Spanish</option>
                        <option value="it">Italian</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Supported Languages
                      </label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="lang-en"
                            value="en"
                            className="h-4 w-4 text-blue-600"
                            checked
                            disabled
                            aria-disabled="true"
                          />
                          <label htmlFor="lang-en" className="dark:text-white">English (Default)</label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="lang-fr"
                            className="h-4 w-4 text-blue-600"
                            aria-label="Support French language"
                          />
                          <label htmlFor="lang-fr" className="dark:text-white">French</label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="lang-de"
                            className="h-4 w-4 text-blue-600"
                            aria-label="Support German language"
                          />
                          <label htmlFor="lang-de" className="dark:text-white">German</label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="lang-es"
                            className="h-4 w-4 text-blue-600"
                            aria-label="Support Spanish language"
                          />
                          <label htmlFor="lang-es" className="dark:text-white">Spanish</label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="lang-it"
                            className="h-4 w-4 text-blue-600"
                            aria-label="Support Italian language"
                          />
                          <label htmlFor="lang-it" className="dark:text-white">Italian</label>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2 dark:text-gray-400">
                        Note: In this demo, only English is fully supported.
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button
                    type="submit"
                    leftIcon={<Save className="h-4 w-4" />}
                    isLoading={isLoading}
                    disabled={!isDirty}
                    aria-disabled={!isDirty}
                  >
                    Save Consent Settings
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
                {brandingSettings && (
                  <ConsentPreview 
                    consentSettings={formValues} 
                    brandingSettings={brandingSettings} 
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Test Mode Modal */}
        {isTestMode && brandingSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-modal="true">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-3xl w-full p-6 m-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                  <Play className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                  Test Mode
                </h3>
                <button 
                  onClick={() => setIsTestMode(false)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  aria-label="Close test mode"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <p className="text-sm text-gray-600 mb-4 dark:text-gray-300">
                In a real implementation, the consent popup would appear when a user visits your website. 
                Here's how your current configuration would look.
              </p>
              
              <div className="relative bg-gray-100 rounded-md dark:bg-gray-700 overflow-hidden">
                {/* Dimmed overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-50 z-10"></div>
                
                {/* Website content */}
                <div className="h-[400px] p-8 flex items-center justify-center">
                  <div className="w-full max-w-4xl mx-auto">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-6">
                      <div className="h-8 w-32 bg-gray-200 dark:bg-gray-600 rounded mb-4"></div>
                      <div className="h-4 w-full bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
                      <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
                      <div className="h-4 w-4/6 bg-gray-200 dark:bg-gray-600 rounded"></div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                        <div className="h-32 bg-gray-200 dark:bg-gray-600 rounded mb-3"></div>
                        <div className="h-4 w-full bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
                        <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-600 rounded"></div>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                        <div className="h-32 bg-gray-200 dark:bg-gray-600 rounded mb-3"></div>
                        <div className="h-4 w-full bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
                        <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-600 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Consent widget */}
                <div className="absolute z-20 left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-[400px] w-full">
                  {formValues.position === 'modal' && brandingSettings && (
                    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-md dark:border-gray-700">
                      <div 
                        className="p-4 flex items-center justify-between"
                        style={{ backgroundColor: brandingSettings.headerColor }}
                      >
                        <div className="flex items-center">
                          {brandingSettings.logo ? (
                            <img 
                              src={brandingSettings.logo} 
                              alt="Logo" 
                              className="h-6 mr-2"
                              onError={(e) => {
                                e.currentTarget.src = 'https://via.placeholder.com/60x24?text=Logo';
                              }}
                            />
                          ) : (
                            <div className="h-6 w-16 bg-white/20 rounded mr-2 flex items-center justify-center text-white text-xs">
                              Logo
                            </div>
                          )}
                          <h3 className="text-white font-medium text-sm">Cookie Consent</h3>
                        </div>
                        
                        <button className="text-white hover:text-gray-200">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="p-4 bg-white dark:bg-gray-800">
                        <p className="text-sm text-gray-700 mb-4 dark:text-gray-300">
                          We use cookies to enhance your experience on our website. By continuing to use this site, you consent to the use of cookies in accordance with our 
                          <a 
                            href="#" 
                            className="ml-1"
                            style={{ color: brandingSettings.linkColor }}
                          >
                            Cookie Policy
                          </a>.
                        </p>
                        
                        <div className="space-y-3 mb-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Check className="h-4 w-4 text-green-500" />
                              <span className="text-sm font-medium dark:text-white">Necessary</span>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Always active</span>
                          </div>
                          
                          {formValues.categories.analytics && (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <input type="checkbox" className="h-4 w-4 text-blue-600" />
                                <span className="text-sm dark:text-white">Analytics</span>
                              </div>
                              <span className="text-xs text-gray-500 dark:text-gray-400">Optional</span>
                            </div>
                          )}
                          
                          {formValues.categories.marketing && (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <input type="checkbox" className="h-4 w-4 text-blue-600" />
                                <span className="text-sm dark:text-white">Marketing</span>
                              </div>
                              <span className="text-xs text-gray-500 dark:text-gray-400">Optional</span>
                            </div>
                          )}
                          
                          {formValues.categories.preferences && (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <input type="checkbox" className="h-4 w-4 text-blue-600" />
                                <span className="text-sm dark:text-white">Preferences</span>
                              </div>
                              <span className="text-xs text-gray-500 dark:text-gray-400">Optional</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          <button 
                            className="px-3 py-1.5 rounded text-xs font-medium"
                            style={{ 
                              backgroundColor: brandingSettings.buttonColor,
                              color: brandingSettings.buttonTextColor
                            }}
                          >
                            Accept All
                          </button>
                          
                          <button 
                            className="px-3 py-1.5 rounded text-xs font-medium border border-gray-300 dark:border-gray-600 dark:text-white"
                          >
                            Reject All
                          </button>
                          
                          <button 
                            className="px-3 py-1.5 rounded text-xs font-medium border border-gray-300 dark:border-gray-600 dark:text-white"
                          >
                            Save Preferences
                          </button>
                        </div>
                        
                        {brandingSettings.poweredBy && (
                          <div className="mt-4 text-center">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Powered By {brandingSettings.poweredBy}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Bottom banner */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 max-w-[400px] w-full">
                  {formValues.position === 'bottom' && brandingSettings && (
                    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-md dark:border-gray-700">
                      <div className="p-3 bg-white dark:bg-gray-800">
                        <p className="text-xs text-gray-700 mb-2 dark:text-gray-300">
                          We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.
                        </p>
                        <div className="flex flex-wrap gap-1">
                          <button 
                            className="px-2 py-1 rounded text-xs font-medium"
                            style={{ 
                              backgroundColor: brandingSettings.buttonColor,
                              color: brandingSettings.buttonTextColor
                            }}
                          >
                            Accept All
                          </button>
                          
                          <button 
                            className="px-2 py-1 rounded text-xs font-medium border border-gray-300 dark:border-gray-600 dark:text-white"
                          >
                            Preferences
                          </button>
                        </div>
                        
                        {brandingSettings.poweredBy && (
                          <div className="mt-2 text-center">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Powered By {brandingSettings.poweredBy}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Top banner */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 max-w-[400px] w-full">
                  {formValues.position === 'top' && brandingSettings && (
                    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-md dark:border-gray-700">
                      <div className="p-3 bg-white dark:bg-gray-800">
                        <p className="text-xs text-gray-700 mb-2 dark:text-gray-300">
                          We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.
                        </p>
                        <div className="flex flex-wrap gap-1">
                          <button 
                            className="px-2 py-1 rounded text-xs font-medium"
                            style={{ 
                              backgroundColor: brandingSettings.buttonColor,
                              color: brandingSettings.buttonTextColor
                            }}
                          >
                            Accept All
                          </button>
                          
                          <button 
                            className="px-2 py-1 rounded text-xs font-medium border border-gray-300 dark:border-gray-600 dark:text-white"
                          >
                            Preferences
                          </button>
                        </div>
                        
                        {brandingSettings.poweredBy && (
                          <div className="mt-2 text-center">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Powered By {brandingSettings.poweredBy}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <Button
                  onClick={() => setIsTestMode(false)}
                >
                  Close Test Mode
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Import Modal */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="import-modal-title">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full dark:bg-gray-800">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white" id="import-modal-title">Import Configuration</h3>
                <button 
                  onClick={() => setShowImportModal(false)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {importError && (
                <div className="bg-red-50 p-3 rounded-md mb-4 dark:bg-red-900/30" role="alert">
                  <p className="text-sm text-red-700 dark:text-red-300">{importError}</p>
                </div>
              )}
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="import-json">
                  Paste your JSON configuration below:
                </label>
                <textarea
                  id="import-json"
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  className="w-full h-40 p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder='{"position": "bottom", "categories": {...}}'
                  aria-describedby="import-error"
                />
                {importError && <p id="import-error" className="sr-only">{importError}</p>}
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowImportModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={processImport}
                >
                  Import
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ConsentBuilderPage;
