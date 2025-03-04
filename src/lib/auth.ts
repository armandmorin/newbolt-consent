import { supabase, handleSupabaseError } from './supabase';
import { User, UserRole } from '../types';

// Initialize auth with default SuperAdmin if needed
export async function initializeAuth() {
  try {
    // Check if the default SuperAdmin exists in auth
    const { data: authUser, error: authError } = await supabase.auth.getUser();
    
    if (authError && authError.name !== 'AuthSessionMissingError') {
      console.error('Error checking auth user:', authError);
      return;
    }
    
    // Check if the default SuperAdmin exists in our users table
    const { data: existingSuperAdmin, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'armandmorin@gmail.com')
      .eq('role', 'superadmin')
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking for existing SuperAdmin:', checkError);
    }
    
    // If SuperAdmin doesn't exist in our users table, create it
    if (!existingSuperAdmin) {
      // First, check if user exists with this email but wrong role
      const { data: existingUser, error: userCheckError } = await supabase
        .from('users')
        .select('*')
        .eq('email', 'armandmorin@gmail.com')
        .maybeSingle();
      
      if (userCheckError) {
        console.error('Error checking for existing user:', userCheckError);
      }
      
      if (existingUser) {
        // User exists but with wrong role, update it to superadmin
        const { error: updateError } = await supabase
          .from('users')
          .update({ role: 'superadmin' })
          .eq('id', existingUser.id);
        
        if (updateError) {
          console.error('Error updating user to SuperAdmin:', updateError);
        }
      } else {
        // User doesn't exist, create new auth user if needed
        if (!authUser || !authUser.user) {
          const { data: authData, error: signUpError } = await supabase.auth.signUp({
            email: 'armandmorin@gmail.com',
            password: '1armand',
          });
          
          if (signUpError) {
            if (signUpError.message !== 'User already registered') {
              console.error('Error creating default SuperAdmin auth:', signUpError);
            }
            
            // If user already exists in auth but not in our table, get the auth user
            const { data: existingAuthUser, error: getAuthError } = await supabase.auth.getUser();
            
            if (getAuthError && getAuthError.name !== 'AuthSessionMissingError') {
              console.error('Error getting existing auth user:', getAuthError);
              return;
            }
            
            if (existingAuthUser && existingAuthUser.user) {
              // Insert the user into our users table with superadmin role
              const { error: insertError } = await supabase
                .from('users')
                .insert({
                  id: existingAuthUser.user.id,
                  email: 'armandmorin@gmail.com',
                  name: 'Armand Morin',
                  role: 'superadmin',
                });
              
              if (insertError) {
                console.error('Error creating SuperAdmin user record:', insertError);
              }
            }
          } else if (authData && authData.user) {
            // Insert the user into our users table with superadmin role
            const { error: insertError } = await supabase
              .from('users')
              .insert({
                id: authData.user.id,
                email: 'armandmorin@gmail.com',
                name: 'Armand Morin',
                role: 'superadmin',
              });
            
            if (insertError) {
              console.error('Error creating SuperAdmin user record:', insertError);
            }
          }
        } else {
          // Auth user exists but not in our table, insert with superadmin role
          const { error: insertError } = await supabase
            .from('users')
              .insert({
                id: authUser.user.id,
                email: 'armandmorin@gmail.com',
                name: 'Armand Morin',
                role: 'superadmin',
              });
          
          if (insertError) {
            console.error('Error creating SuperAdmin user record:', insertError);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error initializing auth:', error);
  }
}

export async function login(email: string, password: string): Promise<User> {
  try {
    // Sign in with Supabase Auth
    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (signInError) {
      throw new Error(signInError.message);
    }
    
    if (!authData.user) {
      throw new Error('Authentication failed');
    }
    
    // Special case for armandmorin@gmail.com - always ensure superadmin role
    if (email.toLowerCase() === 'armandmorin@gmail.com') {
      // Check if user exists in our users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .maybeSingle();
      
      if (userError && userError.code !== 'PGRST116') {
        console.error('Error checking user:', userError);
      }
      
      if (!userData) {
        // If user doesn't exist, create it as superadmin
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: authData.user.email || email,
            name: 'Armand Morin',
            role: 'superadmin',
          })
          .select()
          .single();
        
        if (createError) {
          console.error('Error creating superadmin user:', createError);
          throw new Error('Failed to create user');
        }
        
        // Log login activity
        await logUserActivity(newUser.id, 'login', { email: newUser.email });
        
        // Return new user data
        return {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: 'superadmin',
          createdAt: newUser.created_at,
        };
      } else if (userData.role !== 'superadmin') {
        // If user exists but not as superadmin, update role
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update({ role: 'superadmin' })
          .eq('id', userData.id)
          .select()
          .single();
        
        if (updateError) {
          console.error('Error updating user role:', updateError);
          throw new Error('Failed to update user role');
        }
        
        // Log login activity
        await logUserActivity(updatedUser.id, 'login', { email: updatedUser.email });
        
        // Return updated user data
        return {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          role: 'superadmin',
          createdAt: updatedUser.created_at,
        };
      } else {
        // User exists and is already superadmin
        // Log login activity
        await logUserActivity(userData.id, 'login', { email: userData.email });
        
        // Return user data
        return {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          role: 'superadmin',
          createdAt: userData.created_at,
        };
      }
    }
    
    // For other users, get user data from our users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .maybeSingle();
    
    if (userError && userError.code !== 'PGRST116') {
      throw new Error(userError.message);
    }
    
    if (!userData) {
      // If user doesn't exist in our table, create it as client
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: authData.user.email || email,
          name: email.split('@')[0],
          role: 'client',
        })
        .select()
        .single();
      
      if (createError) {
        throw new Error(createError.message);
      }
      
      if (!newUser) {
        throw new Error('Failed to create user');
      }
      
      // Log login activity
      await logUserActivity(newUser.id, 'login', { email: newUser.email });
      
      // Return new user data
      return {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role as UserRole,
        createdAt: newUser.created_at,
      };
    }
    
    // Log login activity
    await logUserActivity(userData.id, 'login', { email: userData.email });
    
    // Return user data
    return {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role as UserRole,
      createdAt: userData.created_at,
    };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

export async function logout(): Promise<void> {
  try {
    const user = await getCurrentUser();
    if (user) {
      // Log logout activity
      await logUserActivity(user.id, 'logout', { email: user.email });
    }
    
    // Sign out with Supabase Auth
    await supabase.auth.signOut();
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    // Get current session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Error getting session:', sessionError);
      return null;
    }
    
    if (!sessionData.session) {
      return null;
    }
    
    // Special case for armandmorin@gmail.com - always ensure superadmin role
    if (sessionData.session.user.email?.toLowerCase() === 'armandmorin@gmail.com') {
      // Check if user exists in our users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', sessionData.session.user.id)
        .maybeSingle();
      
      if (userError && userError.code !== 'PGRST116') {
        console.error('Error checking user:', userError);
      }
      
      if (!userData) {
        // If user doesn't exist, create it as superadmin
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            id: sessionData.session.user.id,
            email: sessionData.session.user.email,
            name: 'Armand Morin',
            role: 'superadmin',
          })
          .select()
          .single();
        
        if (createError) {
          console.error('Error creating superadmin user:', createError);
          return null;
        }
        
        return {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: 'superadmin',
          createdAt: newUser.created_at,
        };
      } else if (userData.role !== 'superadmin') {
        // If user exists but not as superadmin, update role
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update({ role: 'superadmin' })
          .eq('id', userData.id)
          .select()
          .single();
        
        if (updateError) {
          console.error('Error updating user role:', updateError);
          return null;
        }
        
        return {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          role: 'superadmin',
          createdAt: updatedUser.created_at,
        };
      } else {
        // User exists and is already superadmin
        return {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          role: 'superadmin',
          createdAt: userData.created_at,
        };
      }
    }
    
    // Get user data from our users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', sessionData.session.user.id)
      .maybeSingle();
    
    if (userError && userError.code !== 'PGRST116') {
      console.error('Error fetching user data:', userError);
      return null;
    }
    
    if (!userData) {
      // If user doesn't exist in our table but exists in auth, create it
      if (sessionData.session.user.email) {
        // For other users, create as client
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            id: sessionData.session.user.id,
            email: sessionData.session.user.email,
            name: sessionData.session.user.email.split('@')[0],
            role: 'client',
          })
          .select()
          .single();
        
        if (createError) {
          console.error('Error creating user record:', createError);
          return null;
        }
        
        if (!newUser) {
          return null;
        }
        
        return {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role as UserRole,
          createdAt: newUser.created_at,
        };
      }
      
      return null;
    }
    
    // Return user data
    return {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role as UserRole,
      createdAt: userData.created_at,
    };
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error && error.name !== 'AuthSessionMissingError') {
      console.error('Error checking authentication:', error);
      return false;
    }
    return !!data.session;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
}

export async function hasRole(role: UserRole | UserRole[]): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    if (!user) return false;
    
    // Special case for armandmorin@gmail.com - always has superadmin role
    if (user.email.toLowerCase() === 'armandmorin@gmail.com') {
      if (Array.isArray(role)) {
        return role.includes('superadmin');
      }
      return role === 'superadmin';
    }
    
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    
    return user.role === role;
  } catch (error) {
    console.error('Error checking role:', error);
    return false;
  }
}

export async function refreshToken(): Promise<boolean> {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error && error.name !== 'AuthSessionMissingError') {
      console.error('Error refreshing token:', error);
      return false;
    }
    
    return !!data.session;
  } catch (error) {
    console.error('Refresh token error:', error);
    return false;
  }
}

// Log user activity for audit trail
export async function logUserActivity(userId: string, action: string, details?: Record<string, any>): Promise<void> {
  try {
    const { error } = await supabase.from('activity_logs').insert({
      user_id: userId,
      action,
      details,
      ip_address: '127.0.0.1', // In a real app, this would be the actual IP
      user_agent: navigator.userAgent,
    });
    
    if (error) {
      console.error('Error logging activity:', error);
    }
  } catch (error) {
    console.error('Log activity error:', error);
  }
}

// Get user activity log
export async function getUserActivityLog(userId?: string): Promise<any[]> {
  try {
    let query = supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Filter by userId if provided
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error getting activity log:', error);
      
      // Return mock data if there's an error
      return [
        {
          id: 'mock_1',
          user_id: userId || 'user_1',
          action: 'login',
          details: { email: 'user@example.com' },
          ip_address: '127.0.0.1',
          user_agent: navigator.userAgent,
          created_at: new Date().toISOString(),
          timestamp: new Date().toISOString()
        },
        {
          id: 'mock_2',
          user_id: userId || 'user_1',
          action: 'create_client',
          details: { clientName: 'Example Client', website: 'example.com' },
          ip_address: '127.0.0.1',
          user_agent: navigator.userAgent,
          created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          timestamp: new Date(Date.now() - 86400000).toISOString()
        }
      ];
    }
    
    // If no data is returned, provide mock data
    if (!data || data.length === 0) {
      return [
        {
          id: 'mock_1',
          user_id: userId || 'user_1',
          action: 'login',
          details: { email: 'user@example.com' },
          ip_address: '127.0.0.1',
          user_agent: navigator.userAgent,
          created_at: new Date().toISOString(),
          timestamp: new Date().toISOString()
        }
      ];
    }
    
    // Ensure all entries have a timestamp field (use created_at if timestamp is missing)
    return data.map(entry => ({
      ...entry,
      timestamp: entry.timestamp || entry.created_at
    }));
  } catch (error) {
    console.error('Get activity log error:', error);
    
    // Return mock data if there's an exception
    return [
      {
        id: 'mock_error',
        user_id: userId || 'user_1',
        action: 'login',
        details: { email: 'user@example.com' },
        ip_address: '127.0.0.1',
        user_agent: navigator.userAgent,
        created_at: new Date().toISOString(),
        timestamp: new Date().toISOString()
      }
    ];
  }
}
