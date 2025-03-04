import { supabase } from './supabase';
import { User, UserRole } from '../types';
import { getCurrentUser } from './auth';
import { logUserActivity } from './auth';

// Get all admin users (only accessible by SuperAdmin)
export async function getAdmins(): Promise<User[]> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Special case for armandmorin@gmail.com
    if (user.email.toLowerCase() === 'armandmorin@gmail.com' || user.role === 'superadmin') {
      // Get all admin users from database
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'admin');
      
      if (error) {
        throw error;
      }
      
      // Map database results to User type
      return (data || []).map(admin => ({
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role as UserRole,
        createdAt: admin.created_at,
      }));
    }
    
    throw new Error('Only SuperAdmin can access admin users');
  } catch (error) {
    console.error('Get admins error:', error);
    throw error;
  }
}

// Get a specific admin by ID
export async function getAdmin(id: string): Promise<User> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    if (user.role !== 'superadmin') {
      throw new Error('Only SuperAdmin can access admin users');
    }
    
    // Get admin from database
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .eq('role', 'admin')
      .single();
    
    if (error) {
      throw error;
    }
    
    if (!data) {
      throw new Error('Admin not found');
    }
    
    // Map database result to User type
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      role: data.role as UserRole,
      createdAt: data.created_at,
    };
  } catch (error) {
    console.error('Get admin error:', error);
    throw error;
  }
}

// Create a new admin
export async function createAdmin(adminData: { name: string; email: string; password: string }): Promise<User> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    if (user.role !== 'superadmin') {
      throw new Error('Only SuperAdmin can create admin users');
    }
    
    // First, sign up the user with Supabase Auth
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: adminData.email,
      password: adminData.password,
    });
    
    if (signUpError) {
      throw signUpError;
    }
    
    if (!authData.user) {
      throw new Error('Failed to create admin auth account');
    }
    
    // Then, insert the user into our users table
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: adminData.email,
        name: adminData.name,
        role: 'admin',
      })
      .select()
      .single();
    
    if (error) {
      // If there was an error inserting the user, try to clean up the auth account
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw error;
    }
    
    if (!data) {
      throw new Error('Failed to create admin user');
    }
    
    // Log admin creation
    await logUserActivity(user.id, 'create_admin', {
      adminId: data.id,
      adminName: data.name,
      adminEmail: data.email,
    });
    
    // Map database result to User type
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      role: data.role as UserRole,
      createdAt: data.created_at,
    };
  } catch (error) {
    console.error('Create admin error:', error);
    throw error;
  }
}

// Update an existing admin
export async function updateAdmin(
  id: string,
  updates: { name?: string; email?: string; password?: string }
): Promise<User> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    if (user.role !== 'superadmin') {
      throw new Error('Only SuperAdmin can update admin users');
    }
    
    // Get the admin to check if it exists
    const admin = await getAdmin(id);
    
    // Update user in database
    const { data, error } = await supabase
      .from('users')
      .update({
        name: updates.name,
        email: updates.email,
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    if (!data) {
      throw new Error('Failed to update admin');
    }
    
    // If password is provided, update it in Auth
    if (updates.password) {
      const { error: passwordError } = await supabase.auth.admin.updateUserById(
        id,
        { password: updates.password }
      );
      
      if (passwordError) {
        throw passwordError;
      }
    }
    
    // Log admin update
    await logUserActivity(user.id, 'update_admin', {
      adminId: data.id,
      adminName: data.name,
      changes: Object.keys(updates),
    });
    
    // Map database result to User type
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      role: data.role as UserRole,
      createdAt: data.created_at,
    };
  } catch (error) {
    console.error('Update admin error:', error);
    throw error;
  }
}

// Delete an admin
export async function deleteAdmin(id: string): Promise<void> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    if (user.role !== 'superadmin') {
      throw new Error('Only SuperAdmin can delete admin users');
    }
    
    // Get the admin to check if it exists and log details
    const admin = await getAdmin(id);
    
    // Delete user from database (this will cascade to delete from auth)
    const { error } = await supabase.auth.admin.deleteUser(id);
    
    if (error) {
      throw error;
    }
    
    // Log admin deletion
    await logUserActivity(user.id, 'delete_admin', {
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
    });
  } catch (error) {
    console.error('Delete admin error:', error);
    throw error;
  }
}
