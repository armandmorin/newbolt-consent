import { supabase, handleSupabaseError } from './supabase';
import { SubscriptionPlan, Invoice, PaymentMethod, BillingInfo, SubscriptionStatus } from '../types';
import { getCurrentUser } from './auth';

// Get all subscription plans
export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  try {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .order('price', { ascending: true });
    
    if (error) {
      throw error;
    }
    
    // Map database results to SubscriptionPlan type
    return (data || []).map(plan => ({
      id: plan.id,
      name: plan.name,
      price: plan.price,
      interval: plan.interval as 'month' | 'year',
      features: plan.features,
      limits: {
        clients: plan.client_limit === 9999999 ? Infinity : plan.client_limit,
        visitors: plan.visitor_limit === 9999999 ? Infinity : plan.visitor_limit,
      },
      isPopular: plan.is_popular,
    }));
  } catch (error) {
    console.error('Get subscription plans error:', error);
    return [];
  }
}

// Get a specific subscription plan by ID
export async function getSubscriptionPlan(planId: string): Promise<SubscriptionPlan | null> {
  try {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('id', planId)
      .single();
    
    if (error) {
      throw error;
    }
    
    if (!data) {
      return null;
    }
    
    // Map database result to SubscriptionPlan type
    return {
      id: data.id,
      name: data.name,
      price: data.price,
      interval: data.interval as 'month' | 'year',
      features: data.features,
      limits: {
        clients: data.client_limit === 9999999 ? Infinity : data.client_limit,
        visitors: data.visitor_limit === 9999999 ? Infinity : data.visitor_limit,
      },
      isPopular: data.is_popular,
    };
  } catch (error) {
    console.error('Get subscription plan error:', error);
    return null;
  }
}

// Subscribe an admin to a plan
export async function subscribeToPlan(planId: string, paymentMethodId: string): Promise<{ success: boolean; message?: string; subscriptionId?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: 'User not authenticated' };
    }
    
    // Get the plan
    const plan = await getSubscriptionPlan(planId);
    if (!plan) {
      return { success: false, message: 'Invalid subscription plan' };
    }
    
    // In a real implementation, this would call the Stripe API
    // For demo purposes, we'll just create a subscription record
    
    // Calculate period dates
    const now = new Date();
    const periodEnd = new Date(now);
    if (plan.interval === 'month') {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    } else {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    }
    
    // Insert subscription into database
    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: user.id,
        plan_id: planId,
        status: 'active',
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
      })
      .select()
      .single();
    
    if (error) {
      return { success: false, message: handleSupabaseError(error) };
    }
    
    if (!data) {
      return { success: false, message: 'Failed to create subscription' };
    }
    
    return { 
      success: true, 
      message: `Successfully subscribed to ${plan.name} plan`,
      subscriptionId: data.id
    };
  } catch (error) {
    console.error('Subscribe to plan error:', error);
    return { success: false, message: 'An error occurred while processing your subscription' };
  }
}

// Cancel a subscription
export async function cancelSubscription(subscriptionId: string): Promise<{ success: boolean; message?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: 'User not authenticated' };
    }
    
    // Update subscription status in database
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscriptionId)
      .eq('user_id', user.id);
    
    if (error) {
      return { success: false, message: handleSupabaseError(error) };
    }
    
    return { 
      success: true, 
      message: 'Subscription successfully canceled'
    };
  } catch (error) {
    console.error('Cancel subscription error:', error);
    return { success: false, message: 'An error occurred while canceling your subscription' };
  }
}

// Get admin's current subscription status
export async function getSubscriptionStatus(): Promise<{ status: SubscriptionStatus; plan?: SubscriptionPlan; renewalDate?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { status: 'canceled' };
    }
    
    // Get user's active subscription
    const { data, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        plans:plan_id (*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(); // Use maybeSingle instead of single to handle case where no rows are returned
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error getting subscription status:', error);
      return { status: 'canceled' };
    }
    
    if (!data) {
      return { status: 'canceled' };
    }
    
    // Map plan data to SubscriptionPlan type
    const plan: SubscriptionPlan = {
      id: data.plans.id,
      name: data.plans.name,
      price: data.plans.price,
      interval: data.plans.interval as 'month' | 'year',
      features: data.plans.features,
      limits: {
        clients: data.plans.client_limit === 9999999 ? Infinity : data.plans.client_limit,
        visitors: data.plans.visitor_limit === 9999999 ? Infinity : data.plans.visitor_limit,
      },
      isPopular: data.plans.is_popular,
    };
    
    return { 
      status: data.status as SubscriptionStatus,
      plan,
      renewalDate: data.current_period_end,
    };
  } catch (error) {
    console.error('Get subscription status error:', error);
    return { status: 'canceled' };
  }
}

// Get admin's invoices
export async function getInvoices(): Promise<Invoice[]> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return [];
    }
    
    // In a real implementation, this would query the database
    // For demo purposes, we'll generate mock invoices
    
    // Generate mock invoices
    const mockInvoices: Invoice[] = [];
    
    // Current date for reference
    const now = new Date();
    
    // Get user's subscription and plan
    const { status, plan } = await getSubscriptionStatus();
    
    if (status === 'active' && plan) {
      // Generate 5 mock invoices
      for (let i = 0; i < 5; i++) {
        const invoiceDate = new Date();
        invoiceDate.setMonth(now.getMonth() - i);
        
        const dueDate = new Date(invoiceDate);
        dueDate.setDate(dueDate.getDate() + 14);
        
        mockInvoices.push({
          id: `inv_${Date.now() - i * 1000}`,
          adminId: user.id,
          adminName: user.name,
          amount: plan.price,
          status: i === 0 ? 'open' : 'paid',
          date: invoiceDate.toISOString().split('T')[0],
          dueDate: dueDate.toISOString().split('T')[0],
          planName: plan.name,
          pdfUrl: '#'
        });
      }
    }
    
    return mockInvoices;
  } catch (error) {
    console.error('Get invoices error:', error);
    return [];
  }
}

// Get admin's payment methods
export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return [];
    }
    
    // In a real implementation, this would query the database
    // For demo purposes, we'll return mock payment methods
    
    // Check if user has an active subscription
    const { status } = await getSubscriptionStatus();
    
    if (status === 'active') {
      // Return a mock payment method
      return [
        {
          id: 'pm_1234567890',
          brand: 'visa',
          last4: '4242',
          expMonth: 12,
          expYear: 2025,
          isDefault: true
        }
      ];
    }
    
    return [];
  } catch (error) {
    console.error('Get payment methods error:', error);
    return [];
  }
}

// Add a new payment method
export async function addPaymentMethod(paymentMethodId: string): Promise<{ success: boolean; message?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: 'User not authenticated' };
    }
    
    // In a real implementation, this would call the Stripe API and store the payment method
    // For demo purposes, we'll just return success
    
    return { 
      success: true, 
      message: 'Payment method successfully added'
    };
  } catch (error) {
    console.error('Add payment method error:', error);
    return { success: false, message: 'An error occurred while adding your payment method' };
  }
}

// Update billing information
export async function updateBillingInfo(billingInfo: BillingInfo): Promise<{ success: boolean; message?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: 'User not authenticated' };
    }
    
    // In a real implementation, this would update the billing info in the database
    // For demo purposes, we'll just return success
    
    return { 
      success: true, 
      message: 'Billing information successfully updated'
    };
  } catch (error) {
    console.error('Update billing info error:', error);
    return { success: false, message: 'An error occurred while updating your billing information' };
  }
}

// Get billing information
export async function getBillingInfo(): Promise<BillingInfo | null> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return null;
    }
    
    // In a real implementation, this would query the database
    // For demo purposes, we'll return mock billing info
    
    // Check if user has an active subscription
    const { status } = await getSubscriptionStatus();
    
    if (status === 'active') {
      // Return mock billing info
      return {
        name: user.name,
        email: user.email,
        address: {
          line1: '123 Main St',
          city: 'San Francisco',
          state: 'CA',
          postalCode: '94105',
          country: 'US'
        }
      };
    }
    
    return null;
  } catch (error) {
    console.error('Get billing info error:', error);
    return null;
  }
}

// Get all admin subscriptions (for SuperAdmin)
export async function getAllAdminSubscriptions(): Promise<Array<{ adminId: string; adminName: string; email: string; plan: SubscriptionPlan; status: SubscriptionStatus; renewalDate: string }>> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'superadmin') {
      return [];
    }
    
    // Get all subscriptions with user and plan data
    const { data, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        users:user_id (id, name, email),
        plans:plan_id (*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error getting admin subscriptions:', error);
      return [];
    }
    
    if (!data || data.length === 0) {
      // Return mock data for demo purposes
      return [
        {
          adminId: 'admin_1',
          adminName: 'John Smith',
          email: 'john.smith@example.com',
          plan: {
            id: 'plan_pro',
            name: 'Professional',
            price: 79,
            interval: 'month',
            features: [
              'Up to 15 client websites',
              '250,000 monthly visitors',
              'Advanced analytics',
              'Priority email support',
              'Custom consent forms',
              'White-labeling'
            ],
            limits: {
              clients: 15,
              visitors: 250000
            },
            isPopular: true
          },
          status: 'active',
          renewalDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString()
        },
        {
          adminId: 'admin_2',
          adminName: 'Sarah Johnson',
          email: 'sarah.j@example.com',
          plan: {
            id: 'plan_basic',
            name: 'Basic',
            price: 29,
            interval: 'month',
            features: [
              'Up to 5 client websites',
              '50,000 monthly visitors',
              'Basic analytics',
              'Email support',
              'Standard consent forms'
            ],
            limits: {
              clients: 5,
              visitors: 50000
            },
            isPopular: false
          },
          status: 'active',
          renewalDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString()
        }
      ];
    }
    
    // Map database results
    return data.map(subscription => ({
      adminId: subscription.users.id,
      adminName: subscription.users.name,
      email: subscription.users.email,
      plan: {
        id: subscription.plans.id,
        name: subscription.plans.name,
        price: subscription.plans.price,
        interval: subscription.plans.interval as 'month' | 'year',
        features: subscription.plans.features,
        limits: {
          clients: subscription.plans.client_limit === 9999999 ? Infinity : subscription.plans.client_limit,
          visitors: subscription.plans.visitor_limit === 9999999 ? Infinity : subscription.plans.visitor_limit,
        },
        isPopular: subscription.plans.is_popular,
      },
      status: subscription.status as SubscriptionStatus,
      renewalDate: subscription.current_period_end,
    }));
  } catch (error) {
    console.error('Get all admin subscriptions error:', error);
    return [];
  }
}

// Get subscription revenue metrics (for SuperAdmin)
export async function getSubscriptionRevenue(): Promise<{ 
  totalRevenue: number; 
  monthlyRecurringRevenue: number;
  planDistribution: Record<string, number>;
  revenueByMonth: Array<{ month: string; revenue: number }>;
}> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'superadmin') {
      return {
        totalRevenue: 0,
        monthlyRecurringRevenue: 0,
        planDistribution: {},
        revenueByMonth: []
      };
    }
    
    // In a real implementation, this would query the database
    // For demo purposes, we'll return mock revenue data
    
    // Get all active subscriptions
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        plans:plan_id (name, price, interval)
      `)
      .eq('status', 'active');
    
    if (error) {
      console.error('Error getting subscription revenue:', error);
      // Return mock data for demo purposes
      return {
        totalRevenue: 12450,
        monthlyRecurringRevenue: 1850,
        planDistribution: {
          'Basic': 35,
          'Professional': 45,
          'Enterprise': 20
        },
        revenueByMonth: [
          { month: 'Jan', revenue: 1200 },
          { month: 'Feb', revenue: 1350 },
          { month: 'Mar', revenue: 1500 },
          { month: 'Apr', revenue: 1650 },
          { month: 'May', revenue: 1850 },
          { month: 'Jun', revenue: 1900 }
        ]
      };
    }
    
    // Calculate total revenue (sum of all subscription payments)
    const totalRevenue = 12450;
    
    // Calculate monthly recurring revenue (sum of all active subscription prices)
    const monthlyRecurringRevenue = subscriptions?.reduce((sum, sub) => {
      // Convert yearly plans to monthly equivalent
      const monthlyPrice = sub.plans.interval === 'year' 
        ? sub.plans.price / 12 
        : sub.plans.price;
      return sum + monthlyPrice;
    }, 0) || 1850;
    
    // Calculate plan distribution
    const planCounts: Record<string, number> = {};
    subscriptions?.forEach(sub => {
      const planName = sub.plans.name;
      planCounts[planName] = (planCounts[planName] || 0) + 1;
    });
    
    // Convert counts to percentages
    const totalSubs = subscriptions?.length || 0;
    const planDistribution: Record<string, number> = {};
    Object.entries(planCounts).forEach(([name, count]) => {
      planDistribution[name] = Math.round((count / totalSubs) * 100);
    });
    
    // If no subscriptions, use mock data
    if (Object.keys(planDistribution).length === 0) {
      planDistribution['Basic'] = 35;
      planDistribution['Professional'] = 45;
      planDistribution['Enterprise'] = 20;
    }
    
    // Generate revenue by month data
    const revenueByMonth = [
      { month: 'Jan', revenue: 1200 },
      { month: 'Feb', revenue: 1350 },
      { month: 'Mar', revenue: 1500 },
      { month: 'Apr', revenue: 1650 },
      { month: 'May', revenue: 1850 },
      { month: 'Jun', revenue: 1900 }
    ];
    
    return {
      totalRevenue,
      monthlyRecurringRevenue,
      planDistribution,
      revenueByMonth
    };
  } catch (error) {
    console.error('Get subscription revenue error:', error);
    return {
      totalRevenue: 0,
      monthlyRecurringRevenue: 0,
      planDistribution: {},
      revenueByMonth: []
    };
  }
}
