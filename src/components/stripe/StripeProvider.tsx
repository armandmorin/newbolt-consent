import React, { useEffect, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

interface StripeProviderProps {
  children: React.ReactNode;
}

const StripeProvider: React.FC<StripeProviderProps> = ({ children }) => {
  const [stripePromise, setStripePromise] = useState<Promise<any> | null>(null);

  useEffect(() => {
    // Try to get the Stripe publishable key from localStorage
    const stripeKeys = localStorage.getItem('stripe_keys');
    let publishableKey = 'pk_test_TYooMQauvdEDq54NiTphI7jx'; // Default fallback key
    
    if (stripeKeys) {
      try {
        const parsedKeys = JSON.parse(stripeKeys);
        if (parsedKeys.publishableKey) {
          publishableKey = parsedKeys.publishableKey;
        }
      } catch (error) {
        console.error('Error parsing Stripe keys from localStorage:', error);
      }
    }
    
    // Load Stripe with the publishable key
    setStripePromise(loadStripe(publishableKey));
  }, []);

  if (!stripePromise) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Loading payment provider...</span>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  );
};

export default StripeProvider;
