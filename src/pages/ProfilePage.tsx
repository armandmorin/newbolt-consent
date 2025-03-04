import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Lock, Save, AlertCircle, Eye, EyeOff, Info, Shield } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Layout from '../components/layout/Layout';
import { getCurrentUser } from '../lib/auth';
import { useNotification } from '../context/NotificationContext';
import PasswordStrengthMeter from '../components/auth/PasswordStrengthMeter';
import Tooltip from '../components/ui/Tooltip';

const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  currentPassword: z.string().min(1, 'Current password is required to make changes'),
  newPassword: z.union([
    passwordSchema,
    z.string().length(0)
  ]).optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  // If newPassword is provided, confirmPassword must match
  if (data.newPassword && data.confirmPassword) {
    return data.newPassword === data.confirmPassword;
  }
  return true;
}, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const ProfilePage: React.FC = () => {
  const { showNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [lastLogin, setLastLogin] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });
  
  const newPassword = watch('newPassword');
  
  useEffect(() => {
    // Fetch user data only once when component mounts
    const fetchUserData = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          setUserData(user);
          reset({
            name: user.name,
            email: user.email,
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          });
          
          // Simulate fetching last login time
          setLastLogin(new Date().toISOString());
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load profile data. Please try again.');
      }
    };
    
    fetchUserData();
  }, []); // Empty dependency array ensures this only runs once
  
  const onSubmit = async (data: ProfileFormValues) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, this would call the API to update the user's profile
      // For demo purposes, we'll just simulate a successful update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showNotification('success', 'Profile Updated', 'Your profile has been updated successfully.');
      
      // Reset the password fields
      reset({
        ...data,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      setError(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!userData) {
    return (
      <Layout requiredRoles={['superadmin', 'admin']}>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout requiredRoles={['superadmin', 'admin']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage your account settings and change your password</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                  Personal Information
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
                    placeholder="Enter your name"
                    leftIcon={<User className="h-4 w-4" />}
                    error={errors.name?.message}
                    fullWidth
                    {...register('name')}
                  />
                  
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="Enter your email"
                    leftIcon={<Mail className="h-4 w-4" />}
                    error={errors.email?.message}
                    fullWidth
                    {...register('email')}
                  />
                  
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="currentPassword">
                        Current Password
                      </label>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                        <Lock className="h-4 w-4" />
                      </div>
                      <input
                        id="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="Enter your current password"
                        className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 pl-10 pr-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-500 ${errors.currentPassword ? 'border-red-500 focus:ring-red-500' : ''}`}
                        {...register('currentPassword')}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
                        <button 
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="focus:outline-none"
                          tabIndex={-1}
                          aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                        >
                          {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    {errors.currentPassword && <p className="text-sm text-red-500 dark:text-red-400">{errors.currentPassword.message}</p>}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="newPassword">
                        New Password
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
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Enter new password (optional)"
                        className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 pl-10 pr-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-500 ${errors.newPassword ? 'border-red-500 focus:ring-red-500' : ''}`}
                        {...register('newPassword')}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
                        <button 
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="focus:outline-none"
                          tabIndex={-1}
                          aria-label={showNewPassword ? "Hide password" : "Show password"}
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    {errors.newPassword && <p className="text-sm text-red-500 dark:text-red-400">{errors.newPassword.message}</p>}
                    
                    {newPassword && <PasswordStrengthMeter password={newPassword} />}
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="confirmPassword">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                        <Lock className="h-4 w-4" />
                      </div>
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm new password"
                        className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 pl-10 pr-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-500 ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''}`}
                        {...register('confirmPassword')}
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
                  
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Leave the password fields empty if you don't want to change your password.
                  </p>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button
                    type="submit"
                    leftIcon={<Save className="h-4 w-4" />}
                    isLoading={isLoading}
                  >
                    Save Changes
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Account Type</h3>
                  <p className="text-base font-medium text-gray-900 dark:text-white capitalize">{userData.role}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Account Created</h3>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {new Date(userData.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                {lastLogin && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Login</h3>
                    <p className="text-base font-medium text-gray-900 dark:text-white">
                      {new Date(lastLogin).toLocaleString()}
                    </p>
                  </div>
                )}
                
                <div className="pt-4">
                  <div className="p-3 bg-blue-50 rounded-md dark:bg-blue-900/20">
                    <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Account Status</h3>
                    <div className="mt-2 flex items-center">
                      <div className="h-2.5 w-2.5 rounded-full bg-green-500 mr-2"></div>
                      <p className="text-sm text-blue-700 dark:text-blue-300">Active</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Two-Factor Authentication</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Add an extra layer of security to your account</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Enable
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Session Management</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Manage your active sessions</p>
                  </div>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Login History</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">View your recent login activity</p>
                  </div>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
