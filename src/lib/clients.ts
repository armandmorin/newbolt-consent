import { supabase } from './supabase';
import { Client, ConsentSettings } from '../types';
import { getCurrentUser } from './auth';
import { logUserActivity } from './auth';

// Get all clients for the current admin
export async function getClients(): Promise<Client[]> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return [];
    }
    
    let query = supabase.from('clients').select('*');
    
    // Filter clients based on user role
    if (user.role !== 'superadmin') {
      query = query.eq('admin_id', user.id);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching clients:', error);
      return [];
    }
    
    // If no data is returned, provide empty array
    if (!data || data.length === 0) {
      return [];
    }
    
    // Map database results to Client type
    return (data || []).map(client => ({
      id: client.id,
      name: client.name,
      website: client.website,
      adminId: client.admin_id,
      consentSettings: client.consent_settings as ConsentSettings || {
        position: 'bottom',
        categories: {
          necessary: true,
          analytics: true,
          marketing: false,
          preferences: false,
        },
        languages: ['en'],
        defaultLanguage: 'en',
      },
      createdAt: client.created_at,
    }));
  } catch (error) {
    console.error('Get clients error:', error);
    return [];
  }
}

// Get a specific client by ID
export async function getClient(id: string): Promise<Client> {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching client:', error);
      throw error;
    }
    
    if (!data) {
      throw new Error('Client not found');
    }
    
    // Map database result to Client type
    return {
      id: data.id,
      name: data.name,
      website: data.website,
      adminId: data.admin_id,
      consentSettings: data.consent_settings as ConsentSettings || {
        position: 'bottom',
        categories: {
          necessary: true,
          analytics: true,
          marketing: false,
          preferences: false,
        },
        languages: ['en'],
        defaultLanguage: 'en',
      },
      createdAt: data.created_at,
    };
  } catch (error) {
    console.error('Get client error:', error);
    throw error;
  }
}

// Create a new client
export async function createClient(clientData: Omit<Client, 'id' | 'adminId' | 'createdAt'>): Promise<Client> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    if (user.role === 'client') {
      throw new Error('Client users cannot create clients');
    }
    
    // Insert client into database
    const { data, error } = await supabase
      .from('clients')
      .insert({
        name: clientData.name,
        website: clientData.website,
        admin_id: user.id,
        consent_settings: clientData.consentSettings || {
          position: 'bottom',
          categories: {
            necessary: true,
            analytics: true,
            marketing: false,
            preferences: false,
          },
          languages: ['en'],
          defaultLanguage: 'en',
        },
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating client:', error);
      throw error;
    }
    
    if (!data) {
      throw new Error('Failed to create client');
    }
    
    // Log client creation
    await logUserActivity(user.id, 'create_client', {
      clientId: data.id,
      clientName: data.name,
      website: data.website
    });
    
    // Map database result to Client type
    return {
      id: data.id,
      name: data.name,
      website: data.website,
      adminId: data.admin_id,
      consentSettings: data.consent_settings as ConsentSettings,
      createdAt: data.created_at,
    };
  } catch (error) {
    console.error('Create client error:', error);
    throw error;
  }
}

// Update an existing client
export async function updateClient(
  id: string,
  updates: Partial<Omit<Client, 'id' | 'adminId' | 'createdAt'>>
): Promise<Client> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Get the client to check permissions
    const client = await getClient(id);
    
    // Check permissions
    if (user.role !== 'superadmin' && client.adminId !== user.id) {
      throw new Error('You do not have permission to update this client');
    }
    
    // Update client in database
    const { data, error } = await supabase
      .from('clients')
      .update({
        name: updates.name,
        website: updates.website,
        consent_settings: updates.consentSettings,
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating client:', error);
      throw error;
    }
    
    if (!data) {
      throw new Error('Failed to update client');
    }
    
    // Log client update
    await logUserActivity(user.id, 'update_client', {
      clientId: data.id,
      clientName: data.name,
      website: data.website,
      changes: Object.keys(updates)
    });
    
    // Map database result to Client type
    return {
      id: data.id,
      name: data.name,
      website: data.website,
      adminId: data.admin_id,
      consentSettings: data.consent_settings as ConsentSettings,
      createdAt: data.created_at,
    };
  } catch (error) {
    console.error('Update client error:', error);
    throw error;
  }
}

// Delete a client
export async function deleteClient(id: string): Promise<void> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Get the client to check permissions and log details
    const client = await getClient(id);
    
    // Check permissions
    if (user.role !== 'superadmin' && client.adminId !== user.id) {
      throw new Error('You do not have permission to delete this client');
    }
    
    // Delete client from database
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting client:', error);
      throw error;
    }
    
    // Log client deletion
    await logUserActivity(user.id, 'delete_client', {
      clientId: client.id,
      clientName: client.name,
      website: client.website
    });
  } catch (error) {
    console.error('Delete client error:', error);
    throw error;
  }
}

// Update client consent settings
export async function updateClientConsentSettings(
  id: string,
  consentSettings: ConsentSettings
): Promise<Client> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Get the client to check permissions
    const client = await getClient(id);
    
    // Check permissions
    if (user.role !== 'superadmin' && client.adminId !== user.id) {
      throw new Error('You do not have permission to update this client');
    }
    
    // Update client consent settings in database
    const { data, error } = await supabase
      .from('clients')
      .update({
        consent_settings: consentSettings,
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating client consent settings:', error);
      throw error;
    }
    
    if (!data) {
      throw new Error('Failed to update client consent settings');
    }
    
    // Log consent settings update
    await logUserActivity(user.id, 'update_consent_settings', {
      clientId: data.id,
      clientName: data.name,
    });
    
    // Map database result to Client type
    return {
      id: data.id,
      name: data.name,
      website: data.website,
      adminId: data.admin_id,
      consentSettings: data.consent_settings as ConsentSettings,
      createdAt: data.created_at,
    };
  } catch (error) {
    console.error('Update client consent settings error:', error);
    throw error;
  }
}
