import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CreditCard, Plus, Trash2, Check, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Layout from '../components/layout/Layout';
import { getPaymentMethods, addPaymentMethod, getBillingInfo, updateBillingInfo } from '../lib/subscriptions';
import { PaymentMethod, BillingInfo } from '../types';
import { useNotification } from '../context/NotificationContext';

// Replace with your Stripe publishable key
// In a real app, this would come from an environment variable
const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx');

const PaymentMethodsPage: React.FC = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null);
  const [showAddCard, setShowAddCard] = useState(false);
  const [showEditBilling, setShowEditBilling] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load payment methods
        const paymentMethodsData = await getPaymentMethods();
        setPaymentMethods(paymentMethodsData);
        
        // Load billing info
        const billingInfoData = await getBillingInfo();
        setBillingInfo(billingInfoData);
      } catch (error) {
        console.error('Failed to load payment methods:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleDeletePaymentMethod = (id: string) => {
    // In a real app, this would call the API to delete the payment method
    showNotification('success', 'Payment Method Removed', 'Your payment method has been successfully removed.');
    
    // Update the local state
    setPaymentMethods(paymentMethods.filter(method => method.id !== id));
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payment Methods</h1>
            <p className="text-gray-500 dark:text-gray-400">Manage your payment methods and billing information</p>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => navigate('/billing')}
            >
              Back to Billing
            </Button>
            
            <Button
              onClick={() => setShowAddCard(true)}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Add Payment Method
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                    Payment Methods
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {paymentMethods.length > 0 ? (
                    <div className="space-y-4">
                      {paymentMethods.map((method) => (
                        <div key={method.id} className="flex items-center justify-between p-4 border rounded-md dark:border-gray-700">
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center dark:bg-gray-800">
                              <CreditCard className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {method.brand.charAt(0).toUpperCase() + method.brand.slice(1)} •••• {method.last4}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Expires {method.expMonth}/{method.expYear}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {method.isDefault && (
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                Default
                              </span>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              leftIcon={<Trash2 className="h-4 w-4 text-red-500" />}
                              onClick={() => handleDeletePaymentMethod(method.id)}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-500 dark:text-gray-400">No payment methods found</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => setShowAddCard(true)}
                      >
                        Add Payment Method
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Billing Information</CardTitle>
                </CardHeader>
                <CardContent>
                  {billingInfo ? (
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</p>
                        <p className="text-sm text-gray-900 dark:text-white">{billingInfo.name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</p>
                        <p className="text-sm text-gray-900 dark:text-white">{billingInfo.email}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Billing Address</p>
                        <p className="text-sm text-gray-900 dark:text-white">{billingInfo.address.line1}</p>
                        {billingInfo.address.line2 && (
                          <p className="text-sm text-gray-900 dark:text-white">{billingInfo.address.line2}</p>
                        )}
                        <p className="text-sm text-gray-900 dark:text-white">
                          {billingInfo.address.city}, {billingInfo.address.state} {billingInfo.address.postalCode}
                        </p>
                        <p className="text-sm text-gray-900 dark:text-white">{billingInfo.address.country}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-500 dark:text-gray-400">No billing information found</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => setShowEditBilling(true)}
                  >
                    {billingInfo ? 'Edit Billing Information' : 'Add Billing Information'}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
        
        {/* Add Payment Method Modal */}
        {showAddCard && (
          <Elements stripe={stripePromise}>
            <AddCardModal 
              onClose={() => setShowAddCard(false)} 
              onSuccess={(newMethod) => {
                setPaymentMethods([...paymentMethods, newMethod]);
                setShowAddCard(false);
              }}
            />
          </Elements>
        )}
        
        {/* Edit Billing Information Modal */}
        {showEditBilling && (
          <EditBillingModal 
            initialData={billingInfo}
            onClose={() => setShowEditBilling(false)} 
            onSuccess={(updatedInfo) => {
              setBillingInfo(updatedInfo);
              setShowEditBilling(false);
            }}
          />
        )}
      </div>
    </Layout>
  );
};

interface AddCardModalProps {
  onClose: () => void;
  onSuccess: (newMethod: PaymentMethod) => void;
}

const AddCardModal: React.FC<AddCardModalProps> = ({ onClose, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { showNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardholderName, setCardholderName] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);
    
    if (!cardElement) {
      setError('Card element not found');
      setIsLoading(false);
      return;
    }

    try {
      // In a real implementation, this would call your backend to create a payment method
      // For demo purposes, we'll simulate a successful payment method creation
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate successful payment method creation
      const newMethod: PaymentMethod = {
        id: `pm_${Date.now()}`,
        brand: 'visa',
        last4: '4242',
        expMonth: 12,
        expYear: 2025,
        isDefault: paymentMethods.length === 0, // Make default if it's the first one
      };
      
      showNotification('success', 'Payment Method Added', 'Your payment method has been successfully added.');
      onSuccess(newMethod);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-modal="true">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full dark:bg-gray-800">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add Payment Method</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {error && (
          <div className="bg-red-50 p-3 rounded-md flex items-start mb-4 dark:bg-red-900/30">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 dark:text-red-400" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="cardholderName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Cardholder Name
            </label>
            <input
              id="cardholderName"
              type="text"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              placeholder="John Smith"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="card-element" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Card Details
            </label>
            <div className="p-3 border border-gray-300 rounded-md dark:border-gray-700 dark:bg-gray-800">
              <CardElement id="card-element" options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#32325d',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#fa755a',
                    iconColor: '#fa755a',
                  },
                },
                hidePostalCode: true,
              }} />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isLoading}
              disabled={!stripe || isLoading || !cardholderName}
            >
              Add Payment Method
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface EditBillingModalProps {
  initialData: BillingInfo | null;
  onClose: () => void;
  onSuccess: (updatedInfo: BillingInfo) => void;
}

const EditBillingModal: React.FC<EditBillingModalProps> = ({ initialData, onClose, onSuccess }) => {
  const { showNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<BillingInfo>(initialData || {
    name: '',
    email: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'US',
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [addressField]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // In a real implementation, this would call your backend to update billing info
      // For demo purposes, we'll simulate a successful update
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showNotification('success', 'Billing Information Updated', 'Your billing information has been successfully updated.');
      onSuccess(formData);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-modal="true">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full dark:bg-gray-800">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {initialData ? 'Edit Billing Information' : 'Add Billing Information'}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {error && (
          <div className="bg-red-50 p-3 rounded-md flex items-start mb-4 dark:bg-red-900/30">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 dark:text-red-400" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Smith"
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="address.line1" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Address Line 1
            </label>
            <input
              id="address.line1"
              name="address.line1"
              type="text"
              value={formData.address.line1}
              onChange={handleChange}
              placeholder="123 Main St"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="address.line2" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Address Line 2 (Optional)
            </label>
            <input
              id="address.line2"
              name="address.line2"
              type="text"
              value={formData.address.line2 || ''}
              onChange={handleChange}
              placeholder="Apt 4B"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label htmlFor="address.city" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                City
              </label>
              <input
                id="address.city"
                name="address.city"
                type="text"
                value={formData.address.city}
                onChange={handleChange}
                placeholder="San Francisco"
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="address.state" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                State / Province
              </label>
              <input
                id="address.state"
                name="address.state"
                type="text"
                value={formData.address.state}
                onChange={handleChange}
                placeholder="CA"
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="address.postalCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Postal Code
              </label>
              <input
                id="address.postalCode"
                name="address.postalCode"
                type="text"
                value={formData.address.postalCode}
                onChange={handleChange}
                placeholder="94103"
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="address.country" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Country
            </label>
            <select
              id="address.country"
              name="address.country"
              value={formData.address.country}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            >
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              <option value="GB">United Kingdom</option>
              <option value="AU">Australia</option>
              <option value="DE">Germany</option>
              <option value="FR">France</option>
            </select>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isLoading}
            >
              Save Billing Information
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentMethodsPage;
