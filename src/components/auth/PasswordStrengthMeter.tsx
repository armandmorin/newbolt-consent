import React, { memo } from 'react';

interface PasswordStrengthMeterProps {
  password: string;
}

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  const calculateStrength = (password: string): number => {
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    
    // Character variety checks
    if (/[A-Z]/.test(password)) strength += 1; // Has uppercase
    if (/[a-z]/.test(password)) strength += 1; // Has lowercase
    if (/[0-9]/.test(password)) strength += 1; // Has number
    if (/[^A-Za-z0-9]/.test(password)) strength += 1; // Has special char
    
    return Math.min(strength, 5); // Max strength is 5
  };
  
  const getStrengthLabel = (strength: number): string => {
    switch (strength) {
      case 0: return 'Very Weak';
      case 1: return 'Weak';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Strong';
      case 5: return 'Very Strong';
      default: return '';
    }
  };
  
  const getStrengthColor = (strength: number): string => {
    switch (strength) {
      case 0: return 'bg-red-500';
      case 1: return 'bg-red-400';
      case 2: return 'bg-yellow-500';
      case 3: return 'bg-yellow-400';
      case 4: return 'bg-green-400';
      case 5: return 'bg-green-500';
      default: return 'bg-gray-200';
    }
  };
  
  const strength = calculateStrength(password);
  const strengthPercentage = (strength / 5) * 100;
  
  return (
    <div className="mt-1 space-y-2" aria-live="polite">
      <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700" role="progressbar" aria-valuenow={strengthPercentage} aria-valuemin={0} aria-valuemax={100}>
        <div 
          className={`h-full ${getStrengthColor(strength)} transition-all duration-300 ease-in-out`}
          style={{ width: `${strengthPercentage}%` }}
        ></div>
      </div>
      {password && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Password strength: <span className="font-medium">{getStrengthLabel(strength)}</span>
        </p>
      )}
      {password && strength < 3 && (
        <ul className="text-xs text-gray-500 space-y-1 pl-4 list-disc dark:text-gray-400" aria-label="Password requirements">
          {password.length < 8 && <li>Use at least 8 characters</li>}
          {!/[A-Z]/.test(password) && <li>Include uppercase letters</li>}
          {!/[a-z]/.test(password) && <li>Include lowercase letters</li>}
          {!/[0-9]/.test(password) && <li>Include numbers</li>}
          {!/[^A-Za-z0-9]/.test(password) && <li>Include special characters</li>}
        </ul>
      )}
    </div>
  );
};

// Use memo to prevent unnecessary re-renders
export default memo(PasswordStrengthMeter);
