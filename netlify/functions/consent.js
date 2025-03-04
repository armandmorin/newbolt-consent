// Netlify serverless function to log consent
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

exports.handler = async (event, context) => {
  try {
    // Only accept POST requests
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method not allowed' })
      };
    }
    
    // Parse the request body
    const body = JSON.parse(event.body);
    
    // Validate required fields
    if (!body.clientId || !body.visitorId || !body.consentData) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }
    
    // Log the consent
    const result = await logConsent({
      clientId: body.clientId,
      visitorId: body.visitorId,
      consentData: body.consentData
    });
    
    if (!result.success) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: result.error || 'Failed to log consent' })
      };
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (error) {
    console.error('Error logging consent:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to log consent' })
    };
  }
};

// Log consent from client
async function logConsent(data) {
  try {
    // 1. Verify the clientId exists
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('id', data.clientId)
      .single();
    
    if (clientError || !client) {
      throw new Error('Invalid client ID');
    }
    
    // 2. Get country from IP (in a real implementation)
    // This would use a geolocation service based on the request IP
    const country = 'Unknown';
    
    // 3. Log the consent data to the database
    const { error: insertError } = await supabase
      .from('consent_logs')
      .insert({
        client_id: data.clientId,
        visitor_id: data.visitorId,
        ip_address: '127.0.0.1', // In a real implementation, this would be the actual IP
        country: country,
        consent_given: Object.values(data.consentData.categories).some(val => val === true),
        categories: data.consentData.categories
      });
    
    if (insertError) {
      throw insertError;
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error logging consent:', error);
    return { success: false, error: error.message };
  }
}
