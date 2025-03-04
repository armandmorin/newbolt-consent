import { supabase } from './supabase';
import { BrandingSettings } from '../types';
import { getCurrentUser } from './auth';

// Default branding settings
const defaultBrandingSettings: BrandingSettings = {
  headerColor: '#1e40af',
  linkColor: '#3b82f6',
  buttonColor: '#2563eb',
  buttonTextColor: '#ffffff',
  poweredBy: '@ConsentHub'
};

// Get branding settings for the current user
export async function getBrandingSettings(): Promise<BrandingSettings> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return defaultBrandingSettings;
    }
    
    // Check if branding settings exist for the user
    const { data, error } = await supabase
      .from('branding_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (error) {
      // If no settings found or other error, return defaults
      console.error('Error fetching branding settings:', error);
      return defaultBrandingSettings;
    }
    
    if (!data) {
      // If no data returned, return defaults
      return defaultBrandingSettings;
    }
    
    // Map database result to BrandingSettings type
    return {
      logo: data.logo || undefined,
      headerColor: data.header_color,
      linkColor: data.link_color,
      buttonColor: data.button_color,
      buttonTextColor: data.button_text_color,
      poweredBy: data.powered_by || undefined,
    };
  } catch (error) {
    console.error('Get branding settings error:', error);
    return defaultBrandingSettings;
  }
}

// Update branding settings for the current user
export async function updateBrandingSettings(settings: BrandingSettings): Promise<BrandingSettings> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Check if branding settings exist for the user
    const { data: existingData, error: checkError } = await supabase
      .from('branding_settings')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();
    
    let result;
    
    if (!existingData) {
      // If no settings found, insert new settings
      result = await supabase
        .from('branding_settings')
        .insert({
          user_id: user.id,
          logo: settings.logo,
          header_color: settings.headerColor,
          link_color: settings.linkColor,
          button_color: settings.buttonColor,
          button_text_color: settings.buttonTextColor,
          powered_by: settings.poweredBy,
        })
        .select()
        .single();
    } else {
      // If settings exist, update them
      result = await supabase
        .from('branding_settings')
        .update({
          logo: settings.logo,
          header_color: settings.headerColor,
          link_color: settings.linkColor,
          button_color: settings.buttonColor,
          button_text_color: settings.buttonTextColor,
          powered_by: settings.poweredBy,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select()
        .single();
    }
    
    if (result.error) {
      console.error('Error updating branding settings:', result.error);
      throw result.error;
    }
    
    if (!result.data) {
      throw new Error('Failed to update branding settings');
    }
    
    // Return the updated settings
    return settings;
  } catch (error) {
    console.error('Update branding settings error:', error);
    throw error;
  }
}

// Convert file to base64 string
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}
