import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient<Database>(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    },
    global: {
      headers: {
        'Content-Type': 'application/json'
      },
      fetch: (...args) => {
        // Add a timeout to fetch requests
        const [resource, config] = args;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
        // Use the signal from the controller if config doesn't already have one
        const configWithSignal = {
          ...config,
          signal: (config as RequestInit)?.signal || controller.signal
        };
        
        const promise = fetch(resource, configWithSignal);
        
        promise.finally(() => clearTimeout(timeoutId));
        
        return promise.catch(err => {
          if (err.name === 'AbortError') {
            console.error('Supabase fetch error: Request timed out after 30 seconds');
          } else {
            console.error('Supabase fetch error:', err);
          }
          throw err;
        });
      }
    }
  }
);

// Helper function to handle Supabase errors consistently
export const handleSupabaseError = (error: any): string => {
  console.error('Supabase error:', error);
  
  if (error?.code === 'PGRST116') {
    return 'No data found';
  }
  
  if (error?.code === '23505') {
    return 'A record with this information already exists';
  }
  
  if (error?.code === '23503') {
    return 'This operation would violate referential integrity';
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

// Helper function to check if Supabase is available
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from('plans').select('count').limit(1);
    if (error) {
      console.error('Supabase connection check failed:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Supabase connection check error:', error);
    return false;
  }
};
