import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import Button from '../ui/Button';
import { ConsentSettings, BrandingSettings } from '../../types';

interface ConsentPreviewProps {
  consentSettings: ConsentSettings;
  brandingSettings: BrandingSettings;
}

const ConsentPreview: React.FC<ConsentPreviewProps> = ({
  consentSettings,
  brandingSettings,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="space-y-4">
      {!showDetails ? (
        <div>
          {consentSettings.position === 'top' && (
            <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm dark:border-gray-700 max-w-[400px] mx-auto">
              <div 
                className="p-4 flex items-center"
                style={{ backgroundColor: brandingSettings.headerColor }}
              >
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
              
              <div className="p-4 bg-white dark:bg-gray-800">
                <p className="text-sm text-gray-700 mb-3 dark:text-gray-300">
                  We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies. 
                  <a 
                    href="#" 
                    className="ml-1"
                    style={{ color: brandingSettings.linkColor }}
                  >
                    Learn more
                  </a>
                </p>
                
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
                    Preferences
                  </button>
                </div>
                
                {brandingSettings.poweredBy && (
                  <div className="mt-3 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Powered By {brandingSettings.poweredBy}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {consentSettings.position === 'bottom' && (
            <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm dark:border-gray-700 max-w-[400px] mx-auto">
              <div className="p-4 bg-white dark:bg-gray-800">
                <p className="text-sm text-gray-700 mb-3 dark:text-gray-300">
                  We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies. 
                  <a 
                    href="#" 
                    className="ml-1"
                    style={{ color: brandingSettings.linkColor }}
                  >
                    Learn more
                  </a>
                </p>
                
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
                    Preferences
                  </button>
                </div>
                
                {brandingSettings.poweredBy && (
                  <div className="mt-3 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Powered By {brandingSettings.poweredBy}
                    </p>
                  </div>
                )}
              </div>
              
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
            </div>
          )}
          
          {consentSettings.position === 'modal' && (
            <div className="border border-gray-200 rounded-lg overflow-hidden shadow-md dark:border-gray-700 max-w-[400px] mx-auto">
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
                  
                  {consentSettings.categories.analytics && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" className="h-4 w-4 text-blue-600" />
                        <span className="text-sm dark:text-white">Analytics</span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Optional</span>
                    </div>
                  )}
                  
                  {consentSettings.categories.marketing && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" className="h-4 w-4 text-blue-600" />
                        <span className="text-sm dark:text-white">Marketing</span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Optional</span>
                    </div>
                  )}
                  
                  {consentSettings.categories.preferences && (
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
      ) : (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2 dark:text-white">Selected Categories:</h4>
          <ul className="text-xs text-gray-600 space-y-1 dark:text-gray-300">
            <li className="flex items-center space-x-1">
              <Check className="h-3 w-3 text-green-500" />
              <span>Necessary (Always enabled)</span>
            </li>
            {consentSettings.categories.analytics && (
              <li className="flex items-center space-x-1">
                <Check className="h-3 w-3 text-green-500" />
                <span>Analytics</span>
              </li>
            )}
            {consentSettings.categories.marketing && (
              <li className="flex items-center space-x-1">
                <Check className="h-3 w-3 text-green-500" />
                <span>Marketing</span>
              </li>
            )}
            {consentSettings.categories.preferences && (
              <li className="flex items-center space-x-1">
                <Check className="h-3 w-3 text-green-500" />
                <span>Preferences</span>
              </li>
            )}
          </ul>
        </div>
      )}
      
      {/* Toggle button */}
      {brandingSettings && (
        <div className="flex justify-center mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setShowDetails(!showDetails);
            }}
          >
            {showDetails ? 'Show Banner' : 'Show Preferences'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ConsentPreview;
