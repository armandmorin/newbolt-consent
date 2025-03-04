import React from 'react';
import { Check } from 'lucide-react';
import Button from '../ui/Button';
import { SubscriptionPlan } from '../../types';

interface PlanCardProps {
  plan: SubscriptionPlan;
  isCurrentPlan?: boolean;
  onSelect: (plan: SubscriptionPlan) => void;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan, isCurrentPlan, onSelect }) => {
  return (
    <div className={`border rounded-lg overflow-hidden transition-all ${
      plan.isPopular 
        ? 'border-blue-500 shadow-md dark:border-blue-600' 
        : 'border-gray-200 dark:border-gray-700'
    }`}>
      {plan.isPopular && (
        <div className="bg-blue-500 text-white text-center py-1 text-xs font-medium dark:bg-blue-600">
          MOST POPULAR
        </div>
      )}
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
        
        <div className="mt-4 flex items-baseline">
          <span className="text-3xl font-bold text-gray-900 dark:text-white">${plan.price}</span>
          <span className="ml-1 text-gray-500 dark:text-gray-400">/{plan.interval}</span>
        </div>
        
        <ul className="mt-6 space-y-3">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
            </li>
          ))}
        </ul>
        
        <div className="mt-8">
          <Button
            fullWidth
            variant={plan.isPopular ? 'primary' : 'outline'}
            onClick={() => onSelect(plan)}
            disabled={isCurrentPlan}
          >
            {isCurrentPlan ? 'Current Plan' : 'Select Plan'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PlanCard;
