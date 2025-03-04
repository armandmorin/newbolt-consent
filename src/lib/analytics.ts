import { supabase } from './supabase';
import { ConsentAnalytics, AdminUsage, ClientUsage } from '../types';
import { getCurrentUser } from './auth';

// Get analytics data for the specified date range
export async function getAnalytics(startDate: string, endDate: string): Promise<ConsentAnalytics> {
  try {
    // In a real implementation, this would query the consent_logs table
    // For demo purposes, we'll generate mock data
    return generateMockAnalytics(startDate, endDate);
  } catch (error) {
    console.error('Get analytics error:', error);
    // Return empty analytics data
    return {
      totalVisitors: 0,
      consentRate: 0,
      interactionRate: 0,
      categoryBreakdown: {
        necessary: 0,
        analytics: 0,
        marketing: 0,
        preferences: 0,
      },
      geographicData: {},
      timeData: [],
    };
  }
}

// Generate mock data for top admins by usage
export async function getTopAdmins(limit: number = 10): Promise<AdminUsage[]> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'superadmin') {
      return [];
    }
    
    // In a real implementation, this would query the database
    // For demo purposes, we'll return mock data
    
    // Generate mock usage data for admins
    const mockAdmins: AdminUsage[] = [
      { id: 'admin_1', name: 'John Smith', email: 'john.smith@example.com', totalVisitors: 45872, clientCount: 8, consentRate: 82 },
      { id: 'admin_2', name: 'Sarah Johnson', email: 'sarah.j@example.com', totalVisitors: 38941, clientCount: 6, consentRate: 79 },
      { id: 'admin_3', name: 'Michael Brown', email: 'michael.b@example.com', totalVisitors: 32567, clientCount: 5, consentRate: 85 },
      { id: 'admin_4', name: 'Emily Davis', email: 'emily.d@example.com', totalVisitors: 28934, clientCount: 4, consentRate: 77 },
      { id: 'admin_5', name: 'David Wilson', email: 'david.w@example.com', totalVisitors: 25621, clientCount: 7, consentRate: 81 },
      { id: 'admin_6', name: 'Jessica Taylor', email: 'jessica.t@example.com', totalVisitors: 21453, clientCount: 3, consentRate: 88 },
      { id: 'admin_7', name: 'Daniel Martinez', email: 'daniel.m@example.com', totalVisitors: 19872, clientCount: 4, consentRate: 76 },
      { id: 'admin_8', name: 'Olivia Anderson', email: 'olivia.a@example.com', totalVisitors: 17654, clientCount: 2, consentRate: 83 },
      { id: 'admin_9', name: 'James Thomas', email: 'james.t@example.com', totalVisitors: 15321, clientCount: 3, consentRate: 80 },
      { id: 'admin_10', name: 'Sophia Garcia', email: 'sophia.g@example.com', totalVisitors: 12987, clientCount: 2, consentRate: 84 },
    ];
    
    return mockAdmins.slice(0, limit);
  } catch (error) {
    console.error('Get top admins error:', error);
    return [];
  }
}

// Generate mock data for top clients by usage
export async function getTopClients(limit: number = 10): Promise<ClientUsage[]> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return [];
    }
    
    // In a real implementation, this would query the database
    // For demo purposes, we'll return mock data
    
    // Generate mock usage data for clients
    const mockClients: ClientUsage[] = [
      { id: 'client_1', name: 'E-Commerce Plus', website: 'ecommerceplus.com', totalVisitors: 28754, consentRate: 84, adminName: 'John Smith' },
      { id: 'client_2', name: 'Travel Adventures', website: 'traveladventures.com', totalVisitors: 24321, consentRate: 79, adminName: 'Sarah Johnson' },
      { id: 'client_3', name: 'Tech Solutions', website: 'techsolutions.com', totalVisitors: 21876, consentRate: 86, adminName: 'Michael Brown' },
      { id: 'client_4', name: 'Health & Wellness', website: 'healthandwellness.com', totalVisitors: 19543, consentRate: 81, adminName: 'Emily Davis' },
      { id: 'client_5', name: 'Financial Services', website: 'financialservices.com', totalVisitors: 17654, consentRate: 77, adminName: 'David Wilson' },
      { id: 'client_6', name: 'Education Portal', website: 'educationportal.com', totalVisitors: 15432, consentRate: 89, adminName: 'Jessica Taylor' },
      { id: 'client_7', name: 'Food Delivery', website: 'fooddelivery.com', totalVisitors: 14321, consentRate: 82, adminName: 'Daniel Martinez' },
      { id: 'client_8', name: 'Fashion Trends', website: 'fashiontrends.com', totalVisitors: 12987, consentRate: 78, adminName: 'Olivia Anderson' },
      { id: 'client_9', name: 'Real Estate Group', website: 'realestategroup.com', totalVisitors: 11543, consentRate: 83, adminName: 'James Thomas' },
      { id: 'client_10', name: 'Sports & Fitness', website: 'sportsandfitness.com', totalVisitors: 10876, consentRate: 85, adminName: 'Sophia Garcia' },
    ];
    
    // Filter clients based on user role
    let filteredClients = mockClients;
    if (user.role === 'admin') {
      // Admin only sees their own clients
      filteredClients = mockClients.filter(client => client.adminName === user.name);
    }
    
    return filteredClients.slice(0, limit);
  } catch (error) {
    console.error('Get top clients error:', error);
    return [];
  }
}

// Helper to generate random data for demo
function generateMockAnalytics(startDate: string, endDate: string): ConsentAnalytics {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const daysDiff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  // Generate time series data
  const timeData = [];
  for (let i = 0; i < daysDiff; i++) {
    const date = new Date(start);
    date.setDate(date.getDate() + i);
    
    const visitors = Math.floor(Math.random() * 500) + 100;
    const consents = Math.floor(visitors * (Math.random() * 0.3 + 0.6)); // 60-90% consent rate
    
    timeData.push({
      date: date.toISOString().split('T')[0],
      visitors,
      consents,
    });
  }
  
  // Calculate totals
  const totalVisitors = timeData.reduce((sum, day) => sum + day.visitors, 0);
  const totalConsents = timeData.reduce((sum, day) => sum + day.consents, 0);
  const consentRate = Math.round((totalConsents / totalVisitors) * 100);
  
  return {
    totalVisitors,
    consentRate,
    interactionRate: Math.round(Math.random() * 15 + 80), // 80-95% interaction rate
    categoryBreakdown: {
      necessary: totalConsents, // All consents include necessary
      analytics: Math.floor(totalConsents * 0.85), // 85% accept analytics
      marketing: Math.floor(totalConsents * 0.65), // 65% accept marketing
      preferences: Math.floor(totalConsents * 0.75), // 75% accept preferences
    },
    geographicData: {
      'United States': Math.floor(totalVisitors * 0.4),
      'United Kingdom': Math.floor(totalVisitors * 0.15),
      'Germany': Math.floor(totalVisitors * 0.12),
      'France': Math.floor(totalVisitors * 0.08),
      'Canada': Math.floor(totalVisitors * 0.07),
      'Australia': Math.floor(totalVisitors * 0.05),
      'Japan': Math.floor(totalVisitors * 0.04),
      'Other': Math.floor(totalVisitors * 0.09),
    },
    timeData,
  };
}
