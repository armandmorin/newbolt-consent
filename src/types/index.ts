export type UserRole = 'superadmin' | 'admin' | 'client';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface SuperAdmin extends User {
  role: 'superadmin';
}

export interface Admin extends User {
  role: 'admin';
  brandingSettings: BrandingSettings;
  clients: Client[];
  subscriptionStatus?: SubscriptionStatus;
  subscriptionPlan?: SubscriptionPlan;
}

export interface Client {
  id: string;
  name: string;
  website: string;
  adminId: string;
  consentSettings: ConsentSettings;
  createdAt: string;
}

export interface BrandingSettings {
  logo?: string;
  headerColor: string;
  linkColor: string;
  buttonColor: string;
  buttonTextColor: string;
  poweredBy?: string;
}

export interface ConsentSettings {
  position: 'bottom' | 'top' | 'modal';
  categories: {
    necessary: boolean;
    analytics: boolean;
    marketing: boolean;
    preferences: boolean;
  };
  languages: string[];
  defaultLanguage: string;
  customText?: Record<string, string>;
}

export interface ConsentAnalytics {
  totalVisitors: number;
  consentRate: number;
  interactionRate: number;
  categoryBreakdown: {
    necessary: number;
    analytics: number;
    marketing: number;
    preferences: number;
  };
  geographicData: Record<string, number>;
  timeData: Array<{
    date: string;
    consents: number;
    visitors: number;
  }>;
}

export interface AdminUsage {
  id: string;
  name: string;
  email: string;
  totalVisitors: number;
  clientCount: number;
  consentRate: number;
}

export interface ClientUsage {
  id: string;
  name: string;
  website: string;
  totalVisitors: number;
  consentRate: number;
  adminName: string;
}

export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  limits: {
    clients: number;
    visitors: number;
  };
  isPopular?: boolean;
}

export interface Invoice {
  id: string;
  adminId: string;
  adminName: string;
  amount: number;
  status: 'paid' | 'open' | 'void' | 'uncollectible';
  date: string;
  dueDate: string;
  planName: string;
  pdfUrl?: string;
}

export interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

export interface BillingInfo {
  name: string;
  email: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}
