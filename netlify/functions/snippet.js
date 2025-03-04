// Netlify serverless function to serve client consent snippets
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

exports.handler = async (event, context) => {
  try {
    // Extract adminId and clientId from the path
    // The path will be something like /api/snippet/adminId/clientId.js
    const pathParts = event.path.split('/');
    const adminId = pathParts[pathParts.length - 2];
    const clientId = pathParts[pathParts.length - 1].replace('.js', '');

    if (!adminId || !clientId) {
      return {
        statusCode: 400,
        body: 'Missing admin ID or client ID',
      };
    }

    // Fetch client data from Supabase
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select(`
        *,
        users:admin_id (*)
      `)
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      return {
        statusCode: 404,
        body: 'Client not found',
      };
    }

    // Verify the admin ID matches
    if (client.admin_id !== adminId && client.users?.role !== 'superadmin') {
      return {
        statusCode: 403,
        body: 'Unauthorized access to client snippet',
      };
    }

    // Fetch branding settings
    const { data: brandingData } = await supabase
      .from('branding_settings')
      .select('*')
      .eq('user_id', adminId)
      .maybeSingle();

    // Default branding settings if not available
    const branding = brandingData || {
      header_color: '#1e40af',
      link_color: '#3b82f6',
      button_color: '#2563eb',
      button_text_color: '#ffffff',
      powered_by: '@ConsentHub',
    };

    // Create the configuration object
    const config = {
      clientId,
      position: client.consent_settings?.position || 'bottom',
      categories: {
        necessary: true,
        analytics: client.consent_settings?.categories?.analytics || false,
        marketing: client.consent_settings?.categories?.marketing || false,
        preferences: client.consent_settings?.categories?.preferences || false
      },
      branding: {
        headerColor: branding.header_color,
        linkColor: branding.link_color,
        buttonColor: branding.button_color,
        buttonTextColor: branding.button_text_color,
        logo: branding.logo || '',
        poweredBy: branding.powered_by
      }
    };

    // Read the template file
    const fs = require('fs');
    const path = require('path');
    const template = fs.readFileSync(path.join(__dirname, 'snippet-template.js'), 'utf8');

    // Replace configuration placeholders
    const script = template.replace('{{CONFIG}}', JSON.stringify(config, null, 2));

    // Return the JavaScript with appropriate headers
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*'
      },
      body: script
    };
  } catch (error) {
    console.error('Error serving snippet:', error);
    return {
      statusCode: 500,
      body: `console.error('ConsentHub: Error loading consent management script', ${JSON.stringify(error.message)});`
    };
  }
};
