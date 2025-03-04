import React from 'react';
import { Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { SubscriptionStatus as Status, SubscriptionPlan } from '../../types';

interface SubscriptionStatusProps {
  status: Status;
  plan?: SubscriptionPlan;
  renewalDate?: string;
}

const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({ status, plan, renewalDate }) => {
  const getStatusDetails = () => {
    switch (status) {
      case 'active':
        return {
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          label: 'Active',
          description: plan ? `Your ${plan.name} plan is active.` : 'Your subscription is active.',
          color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
        };
      case 'trialing':
        return {
          icon: <Clock className="h-5 w-5 text-blue-500" />,
          label: 'Trial',
          description: plan ? `Your ${plan.name} plan trial is active.` : 'Your subscription trial is active.',
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
        };
      case 'past_due':
        return {
          icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
          label: 'Past Due',
          description: 'Your payment is past due. Please update your payment method.',
          color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
        };
      case 'canceled':
        return {
          icon: <XCircle className="h-5 w-5 text-red-500" />,
          label: 'Canceled',
          description: 'Your subscription has been canceled.',
          color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
        };
      case 'unpaid':
        return {
          icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
          label: 'Unpaid',
          description: 'Your subscription is unpaid. Please update your payment method.',
          color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
        };
      case 'incomplete':
        return {
          icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
          label: 'Incomplete',
          description: 'Your subscription setup is incomplete.',
          color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
        };
      default:
        return {
          icon: <XCircle className="h-5 w-5 text-gray-500" />,
          label: 'Unknown',
          description: 'Subscription status unknown.',
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
        };
    }
  };

  const { icon, label, description, color } = getStatusDetails();

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center space-x-2">
        {icon}
        <span className={`text-sm font-medium px-2 py-1 rounded-full ${color}`}>
          {label}
        </span>
      </div>
      
      <p className="text-sm text-gray-700 dark:text-gray-300">{description}</p>
      
      {renewalDate && status === 'active' && (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Next billing date: <span className="font-medium">{new Date(renewalDate).toLocaleDateString()}</span>
        </p>
      )}
      
      {plan && status !== 'canceled' && (
        <div className="mt-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Plan Details:</h4>
          <ul className="mt-1 text-sm text-gray-600 space-y-1 dark:text-gray-400">
            <li>• Up to {plan.limits.clients === Infinity ? 'unlimited' : plan.limits.clients} client websites</li>
            <li>• {plan.limits.visitors === Infinity ? 'Unlimited' : `${(plan.limits.visitors / 1000).toFixed(0)}K`} monthly visitors</li>
            <li>• ${plan.price}/{plan.interval}</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default SubscriptionStatus;
