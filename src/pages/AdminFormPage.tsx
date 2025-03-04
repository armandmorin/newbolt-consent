import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, User, Mail, Lock, Save, AlertCircle, Shield, Eye, EyeOff, Info } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Layout from '../components/layout/Layout';
import { createAdmin, getAdmin, updateAdmin } from '../lib/admins';
import PasswordStrengthMeter from '../components/auth/PasswordStrengthMeter';
import Tooltip from '../components/ui/Tooltip';
import { useNotification } from '../context/NotificationContext';

const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

const adminSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.union([
    passwordSchema,
    z.string().length(0)
  ]).optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  // If password is provided, confirmPassword must match
  if (data.password && data.confirmPassword) {
    return data.password === data.confirmPassword;
  }
  return true;
}, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type AdminFormValues = z.infer<typeof adminSchema>;

const AdminFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const { showNotification } = useNotification();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Use refs to store password values to prevent re-renders
  const passwordRef = useRef('');
  const confirmPasswordRef = useRef('');
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<AdminFormValues>({
    resolver: zodResolver(adminSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });
  
  // Memoize password change handlers to prevent re-renders
  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    passwordRef.current = e.target.value;
    // Force re-render for password strength meter without updating form state
    e.target.dispatchEvent(new Event('input', { bubbles: true }));
  }, []);
  
  const handleConfirmPasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    confirmPasswordRef.current = e.target.value;
  }, []);
  
  useEffect(() => {
    if (isEditMode && id) {
      const loadAdmin = async () => {
        try {
          setIsLoading(true);
          const admin = await getAdmin(id);
          reset({
            name: admin.name,
            email: admin.email,
            // Don't set password when editing
            password: '',
            confirmPassword: '',
          });
          // Reset password refs too
          passwordRef.current = '';
          confirmPasswordRef.current = '';
        } catch (error: any) {
          console.error('Failed to load admin:', error);
          setError(error?.message || 'Failed to load admin details. Please try again.');
          showNotification('error', 'Error', 'Failed to load admin details');
        } finally {
          setIsLoading(false);
        }
      };
      
      loadAdmin();
    }
  }, [isEditMode, id, reset, showNotification]);
  
  const onSubmit = async (data: AdminFormValues) => {
    // Get password values from refs
    const passwordValue = passwordRef.current;
    const confirmPasswordValue = confirmPasswordRef.current;
    
    // Validate passwords match
    if (passwordValue !== confirmPasswordValue) {
      setError("Passwords don't match");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      if (isEditMode && id) {
        // When editing, only update if password is provided
        const updateData = {
          name: data.name,
          email: data.email,
          ...(passwordValue ? { password: passwordValue } : {}),
        };
        
        await updateAdmin(id, updateData);
        showNotification('success', 'Admin Updated', 'The admin has been updated successfully');
      } else {
        // When creating, password is required
        if (!passwordValue) {
          setError('Password is required when creating a new admin');
          setIsLoading(false);
          return;
        }
        
        await createAdmin({
          name: data.name,
          email: data.email,
          password: passwordValue,
        });
        showNotification('success', 'Admin Created', 'The admin has been created successfully');
      }
      
      navigate('/admins');
    } catch (error: any) {
      console.error('Failed to save admin:', error);
      setError(error?.message || 'Failed to save admin. Please try again.');
      showNotification('error', 'Error', error?.message || 'Failed to save admin');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Layout requiredRoles={['superadmin']}>
      <div className="space-y-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            onClick={() => navigate('/admins')}
          >
            Back to Admins
          </Button>
        </div>
        
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEditMode ? 'Edit Admin' : 'Add New Admin'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {isEditMode
              ? 'Update admin information and permissions'
              : 'Add a new admin user to the system'}
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
              Admin Information
            </CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-red-50 p-3 rounded-md flex items-start dark:bg-red-900/30">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 dark:text-red-400" />
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}
              
              <Input
                label="Full Name"
                placeholder="Enter admin name"
                leftIcon={<User className="h-4 w-4" />}
                error={errors.name?.message}
                fullWidth
                autoComplete="name"
                {...register('name')}
              />
              
              <Input
                label="Email Address"
                type="email"
                placeholder="Enter admin email"
                leftIcon={<Mail className="h-4 w-4" />}
                error={errors.email?.message}
                fullWidth
                autoComplete="email"
                {...register('email')}
              />
              
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {isEditMode ? "Password (leave blank to keep unchanged)" : "Password"}
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
                    type={showPassword ? "text" : "password"}
                    placeholder={isEditMode ? "Enter new password (optional)" : "Enter password"}
                    className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 pl-10 pr-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-500 ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                    autoComplete="new-password"
                    defaultValue=""
                    onChange={handlePasswordChange}
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
                {errors.password && <p className="text-sm text-red-500 dark:text-red-400">{errors.password.message}</p>}
                
                {passwordRef.current && <PasswordStrengthMeter password={passwordRef.current} />}
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {isEditMode ? "Confirm Password (if changing)" : "Confirm Password"}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm password"
                    className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 pl-10 pr-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-500 ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''}`}
                    autoComplete="new-password"
                    defaultValue=""
                    onChange={handleConfirmPasswordChange}
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
                {errors.confirmPassword && <p className="text-sm text-red-500 dark:text-red-400">{errors.confirmPassword.message}</p>}
              </div>
              
              {isEditMode && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Note: Leave the password fields blank if you don't want to change the password.
                </p>
              )}
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                type="submit"
                leftIcon={<Save className="h-4 w-4" />}
                isLoading={isLoading}
              >
                {isEditMode ? 'Update Admin' : 'Create Admin'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminFormPage;
