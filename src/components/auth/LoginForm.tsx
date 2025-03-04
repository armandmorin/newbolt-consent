import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, AlertCircle, Eye, EyeOff, Info } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { login } from '../../lib/auth';
import Tooltip from '../ui/Tooltip';
import PasswordStrengthMeter from './PasswordStrengthMeter';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  const password = watch('password');
  
  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await login(data.email, data.password);
      setLoginAttempts(0);
      onSuccess();
    } catch (err) {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      
      if (newAttempts >= 5) {
        setError('Too many failed login attempts. Please try again later.');
      } else {
        setError('Invalid email or password. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="bg-red-50 p-3 rounded-md flex items-start dark:bg-red-900/30" role="alert">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 dark:text-red-400" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}
      
      <Input
        label="Email"
        type="email"
        placeholder="Enter your email"
        leftIcon={<Mail className="h-4 w-4" />}
        error={errors.email?.message}
        fullWidth
        autoComplete="email"
        aria-required="true"
        {...register('email')}
      />
      
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="password">Password</label>
          <Tooltip content="Password must be at least 6 characters">
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
            placeholder="Enter your password"
            className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 pl-10 pr-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-500 ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
            autoComplete="current-password"
            aria-required="true"
            aria-invalid={errors.password ? "true" : "false"}
            {...register('password')}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
            <button 
              type="button" 
              onClick={togglePasswordVisibility}
              className="focus:outline-none"
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        {errors.password && <p className="text-sm text-red-500 dark:text-red-400" id="password-error">{errors.password.message}</p>}
        
        {password && <PasswordStrengthMeter password={password} />}
      </div>
      
      <Button
        type="submit"
        fullWidth
        isLoading={isLoading}
        disabled={loginAttempts >= 5}
        aria-disabled={loginAttempts >= 5}
      >
        Sign In
      </Button>
    </form>
  );
};

export default LoginForm;
