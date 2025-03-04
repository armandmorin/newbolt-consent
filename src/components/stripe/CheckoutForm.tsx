import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { StripeCardElementOptions } from '@stripe/stripe-js';
import Button from '../ui/Button';
import { AlertCircle, User, Mail, Lock, Eye, EyeOff, Info } from 'lucide-react';
import Tooltip from '../ui/Tooltip';
import PasswordStrengthMeter from '../auth/PasswordStrengthMeter';

interface CheckoutFormProps {
  planId: string;
  onSuccess: (subscriptionId: string) => void;
  onCancel: () => void;
}

const cardElementOptions: StripeCardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#32325d',
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
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
};

const CheckoutForm: React.FC<CheckoutFormProps> = ({ planId, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState<'account' | 'payment'>('account');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (step === 'account') {
      // Validate account information
      if (!name.trim()) {
        setError('Name is required');
        return;
      }
      
      if (!email.trim()) {
        setError('Email is required');
        return;
      }
      
      if (!email.includes('@') || !email.includes('.')) {
        setError('Please enter a valid email address');
        return;
      }
      
      if (!password) {
        setError('Password is required');
        return;
      }
      
      if (password.length < 8) {
        setError('Password must be at least 8 characters');
        return;
      }
      
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      
      // Move to payment step
      setError(null);
      setStep('payment');
      return;
    }

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet
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
      // In a real implementation, this would:
      // 1. Create a user account with the provided email/password
      // 2. Call your backend to create a payment intent
      // 3. Confirm the payment with Stripe
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate successful subscription
      const subscriptionId = `sub_${Date.now()}`;
      onSuccess(subscriptionId);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setStep('account');
    setError(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 p-3 rounded-md flex items-start dark:bg-red-900/30">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 dark:text-red-400" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}
      
      {step === 'account' ? (
        <>
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Account Information</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Create your account to manage your subscription
            </p>
            
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <User className="h-4 w-4" />
                </div>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Smith"
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="password">
                  Password
                </label>
                <Tooltip content="Password must be at least 8 characters with uppercase, lowercase, number, and special character">
                  <span className="cursor-help">
                    <Info className="h-4 w-4 text-gray-400" />
                  </span>
                </Tooltip>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-10 pr-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="focus:outline-none"
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              {password && <PasswordStrengthMeter password={password} />}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-10 pr-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
                  <button 
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="focus:outline-none"
                    tabIndex={-1}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
            >
              Continue to Payment
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Payment Information</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Your payment information is securely processed by Stripe
            </p>
            
            <div className="space-y-2">
              <label htmlFor="card-element" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Credit or Debit Card
              </label>
              <div className="p-3 border border-gray-300 rounded-md dark:border-gray-700 dark:bg-gray-800">
                <CardElement id="card-element" options={cardElementOptions} />
              </div>
            </div>
            
            <div className="mt-4 bg-blue-50 p-3 rounded-md dark:bg-blue-900/20">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Your subscription will begin immediately after your payment is processed. You can cancel anytime from your account settings.
              </p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
            >
              Back
            </Button>
            <Button
              type="submit"
              isLoading={isLoading}
              disabled={!stripe || isLoading}
            >
              Subscribe
            </Button>
          </div>
        </>
      )}
    </form>
  );
};

export default CheckoutForm;
