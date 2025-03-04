import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, FileText, Clock, Download, AlertCircle, CheckCircle, CreditCard as CreditCardIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Layout from '../components/layout/Layout';
import { getSubscriptionStatus, getInvoices, getPaymentMethods, cancelSubscription } from '../lib/subscriptions';
import { Invoice, PaymentMethod, SubscriptionStatus as Status, SubscriptionPlan } from '../types';
import SubscriptionStatus from '../components/subscription/SubscriptionStatus';
import { useNotification } from '../context/NotificationContext';
import { formatDate } from '../lib/utils';

const BillingPage: React.FC = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<Status>('canceled');
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan | undefined>(undefined);
  const [renewalDate, setRenewalDate] = useState<string | undefined>(undefined);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isCanceling, setIsCanceling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load subscription status
        const subscription = await getSubscriptionStatus();
        setSubscriptionStatus(subscription.status);
        setCurrentPlan(subscription.plan);
        setRenewalDate(subscription.renewalDate);
        
        // Load invoices
        const invoicesData = await getInvoices();
        setInvoices(invoicesData);
        
        // Load payment methods
        const paymentMethodsData = await getPaymentMethods();
        setPaymentMethods(paymentMethodsData);
      } catch (error) {
        console.error('Failed to load billing data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleCancelSubscription = async () => {
    try {
      setIsCanceling(true);
      
      // In a real implementation, this would call the API to cancel the subscription
      const result = await cancelSubscription('sub_123456');
      
      if (result.success) {
        setSubscriptionStatus('canceled');
        setShowCancelConfirm(false);
        showNotification('success', 'Subscription Canceled', 'Your subscription has been successfully canceled.');
      } else {
        showNotification('error', 'Error', result.message || 'Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      showNotification('error', 'Error', 'An unexpected error occurred');
    } finally {
      setIsCanceling(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Billing & Subscription</h1>
            <p className="text-gray-500 dark:text-gray-400">Manage your subscription, payment methods, and billing history</p>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => navigate('/billing/payment-methods')}
              leftIcon={<CreditCardIcon className="h-4 w-4" />}
            >
              Payment Methods
            </Button>
            
            {subscriptionStatus !== 'canceled' && (
              <Button
                variant="outline"
                onClick={() => setShowCancelConfirm(true)}
              >
                Cancel Subscription
              </Button>
            )}
            
            {subscriptionStatus === 'canceled' && (
              <Button
                onClick={() => navigate('/plans')}
              >
                Subscribe
              </Button>
            )}
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                      Subscription Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SubscriptionStatus 
                      status={subscriptionStatus} 
                      plan={currentPlan}
                      renewalDate={renewalDate}
                    />
                  </CardContent>
                  <CardFooter>
                    {subscriptionStatus === 'active' && (
                      <div className="flex space-x-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate('/plans')}
                        >
                          Change Plan
                        </Button>
                      </div>
                    )}
                    
                    {subscriptionStatus === 'canceled' && (
                      <Button
                        size="sm"
                        onClick={() => navigate('/plans')}
                      >
                        Subscribe Now
                      </Button>
                    )}
                    
                    {subscriptionStatus === 'past_due' && (
                      <Button
                        size="sm"
                        onClick={() => navigate('/billing/payment-methods')}
                      >
                        Update Payment Method
                      </Button>
                    )}
                  </CardFooter>
                </Card>
                
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                      Billing History
                    </CardTitle>
                    <CardDescription>
                      Your recent invoices and payment history
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {invoices.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:text-gray-300 dark:bg-gray-800">
                            <tr>
                              <th className="px-4 py-3">Date</th>
                              <th className="px-4 py-3">Invoice</th>
                              <th className="px-4 py-3">Amount</th>
                              <th className="px-4 py-3">Status</th>
                              <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {invoices.map((invoice) => (
                              <tr key={invoice.id} className="bg-white border-b hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600">
                                <td className="px-4 py-3">{formatDate(invoice.date)}</td>
                                <td className="px-4 py-3">{invoice.planName} Subscription</td>
                                <td className="px-4 py-3">${invoice.amount.toFixed(2)}</td>
                                <td className="px-4 py-3">
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    invoice.status === 'paid' 
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                                      : invoice.status === 'open'
                                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                  }`}>
                                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    leftIcon={<Download className="h-4 w-4" />}
                                    onClick={() => {
                                      // In a real app, this would download the invoice PDF
                                      showNotification('info', 'Download Started', 'Your invoice download has started');
                                    }}
                                  >
                                    Download
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-gray-500 dark:text-gray-400">No invoices found</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <div>
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
                          <div key={method.id} className="flex items-center justify-between p-3 border rounded-md dark:border-gray-700">
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
                            {method.isDefault && (
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                Default
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-gray-500 dark:text-gray-400">No payment methods found</p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="outline"
                      fullWidth
                      onClick={() => navigate('/billing/payment-methods')}
                    >
                      Manage Payment Methods
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Need Help?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      If you have any questions about your billing or subscription, please contact our support team.
                    </p>
                    <Button
                      variant="outline"
                      fullWidth
                      onClick={() => navigate('/help')}
                    >
                      Contact Support
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
        
        {/* Cancel Subscription Confirmation Modal */}
        {showCancelConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-modal="true">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full dark:bg-gray-800">
              <div className="flex items-center mb-4">
                <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Cancel Subscription</h3>
              </div>
              
              <p className="text-sm text-gray-600 mb-4 dark:text-gray-400">
                Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your current billing period.
              </p>
              
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowCancelConfirm(false)}
                  disabled={isCanceling}
                >
                  Keep Subscription
                </Button>
                <Button
                  variant="danger"
                  onClick={handleCancelSubscription}
                  isLoading={isCanceling}
                >
                  Cancel Subscription
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BillingPage;
