import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { BarChart2, Check, CreditCard, ArrowRight, Shield, Globe, Users } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import CheckoutForm from '../components/stripe/CheckoutForm';
import { getSubscriptionPlans } from '../lib/subscriptions';
import { SubscriptionPlan } from '../types';
import { useNotification } from '../context/NotificationContext';
import StripeProvider from '../components/stripe/StripeProvider';

const PlansPage: React.FC = () => {
  const { showNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(true);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load subscription plans
        const plansData = await getSubscriptionPlans();
        setPlans(plansData);
      } catch (error) {
        console.error('Failed to load plans:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setShowCheckout(true);
  };

  const handleCheckoutSuccess = (subscriptionId: string) => {
    showNotification('success', 'Subscription Successful', `You have successfully subscribed to the ${selectedPlan?.name} plan.`);
    setShowCheckout(false);
  };

  const handleCheckoutCancel = () => {
    setShowCheckout(false);
    setSelectedPlan(null);
  };

  // Filter plans by billing interval
  const filteredPlans = plans.filter(plan => plan.interval === billingInterval);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="flex items-center">
                  <BarChart2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">ConsentHub</span>
                </Link>
              </div>
            </div>
            
            <div className="flex items-center">
              <Link to="/login">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl sm:tracking-tight">
            <span className="block">Simple, transparent pricing</span>
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500 dark:text-gray-400">
            Choose the perfect plan for your consent management needs
          </p>
          
          <div className="flex items-center justify-center mt-8 space-x-2 bg-gray-100 p-1 rounded-md inline-flex dark:bg-gray-800">
            <button
              className={`px-4 py-2 text-sm font-medium rounded ${
                billingInterval === 'month' 
                  ? 'bg-white shadow-sm text-gray-900 dark:bg-gray-700 dark:text-white' 
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
              onClick={() => setBillingInterval('month')}
            >
              Monthly
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium rounded ${
                billingInterval === 'year' 
                  ? 'bg-white shadow-sm text-gray-900 dark:bg-gray-700 dark:text-white' 
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
              onClick={() => setBillingInterval('year')}
            >
              Yearly
            </button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {filteredPlans.map((plan) => (
                <div key={plan.id} className={`rounded-lg overflow-hidden shadow-lg transition-all ${
                  plan.isPopular 
                    ? 'border-2 border-blue-500 dark:border-blue-600 ring-4 ring-blue-500/10' 
                    : 'border border-gray-200 dark:border-gray-700'
                }`}>
                  {plan.isPopular && (
                    <div className="bg-blue-500 text-white text-center py-2 text-sm font-medium dark:bg-blue-600">
                      MOST POPULAR
                    </div>
                  )}
                  
                  <div className="p-6 bg-white dark:bg-gray-800">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                    
                    <div className="mt-4 flex items-baseline">
                      <span className="text-4xl font-extrabold text-gray-900 dark:text-white">${plan.price}</span>
                      <span className="ml-1 text-xl font-medium text-gray-500 dark:text-gray-400">/{plan.interval}</span>
                    </div>
                    
                    <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                      Perfect for {plan.name === 'Basic' ? 'small businesses' : plan.name === 'Professional' ? 'growing businesses' : 'large enterprises'}
                    </p>
                    
                    <div className="mt-6">
                      <Button
                        fullWidth
                        variant={plan.isPopular ? 'primary' : 'outline'}
                        onClick={() => handleSelectPlan(plan)}
                        rightIcon={<ArrowRight className="h-4 w-4" />}
                      >
                        Get Started
                      </Button>
                    </div>
                    
                    <ul className="mt-6 space-y-4">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">Plan includes:</h4>
                      <ul className="mt-2 space-y-2">
                        <li className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <Users className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                          Up to {plan.limits.clients === Infinity ? 'unlimited' : plan.limits.clients} client websites
                        </li>
                        <li className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <Globe className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                          {plan.limits.visitors === Infinity ? 'Unlimited' : `${(plan.limits.visitors / 1000).toFixed(0)}K`} monthly visitors
                        </li>
                        <li className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <Shield className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                          GDPR & CCPA compliant
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-20">
              <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
                Frequently Asked Questions
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-sm dark:bg-gray-800">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">What is ConsentHub?</h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    ConsentHub is a comprehensive consent management platform that helps websites comply with privacy regulations like GDPR, CCPA, and ePrivacy Directive by managing cookie consent and user preferences.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm dark:bg-gray-800">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">How does billing work?</h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    We offer both monthly and annual billing options. Annual plans come with a discount compared to monthly billing. You can upgrade, downgrade, or cancel your subscription at any time.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm dark:bg-gray-800">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Can I change my plan later?</h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Yes, you can upgrade or downgrade your plan at any time. Changes will be applied at the start of your next billing cycle.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm dark:bg-gray-800">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">How do I cancel my subscription?</h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    You can cancel your subscription at any time from the Billing page. Your plan will remain active until the end of your current billing period.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm dark:bg-gray-800">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">What payment methods do you accept?</h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    We accept all major credit cards including Visa, Mastercard, American Express, and Discover.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm dark:bg-gray-800">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Do you offer refunds?</h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    We don't offer refunds for subscription payments, but you can cancel at any time to prevent future charges.
                  </p>
                </div>
              </div>
              
              <div className="mt-12 text-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Still have questions?</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Contact our support team for more information about our plans and pricing.
                </p>
                <Button className="mt-4" variant="outline">
                  Contact Support
                </Button>
              </div>
            </div>
          </>
        )}
        
        {/* Checkout Modal */}
        {showCheckout && selectedPlan && (
          <StripeProvider>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-modal="true">
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full dark:bg-gray-800">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                    <CreditCard className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                    Subscribe to {selectedPlan.name}
                  </h3>
                  <button 
                    onClick={handleCheckoutCancel}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                    aria-label="Close"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="mb-6 p-4 bg-gray-50 rounded-md dark:bg-gray-700">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-300">{selectedPlan.name} Plan</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">${selectedPlan.price}/{selectedPlan.interval}</span>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-2 mt-2 dark:border-gray-600">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Total</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">${selectedPlan.price}/{selectedPlan.interval}</span>
                    </div>
                  </div>
                </div>
                
                <CheckoutForm 
                  planId={selectedPlan.id}
                  onSuccess={handleCheckoutSuccess}
                  onCancel={handleCheckoutCancel}
                />
              </div>
            </div>
          </StripeProvider>
        )}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex justify-center md:justify-start">
              <Link to="/" className="flex items-center">
                <BarChart2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">ConsentHub</span>
              </Link>
            </div>
            <div className="mt-8 md:mt-0">
              <p className="text-center text-base text-gray-500 dark:text-gray-400">
                &copy; {new Date().getFullYear()} ConsentHub. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PlansPage;
