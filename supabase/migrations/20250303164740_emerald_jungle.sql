-- Create auth schema if it doesn't exist (for custom auth functions)
CREATE SCHEMA IF NOT EXISTS auth;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('superadmin', 'admin', 'client')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  website TEXT NOT NULL,
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  consent_settings JSONB DEFAULT '{"position": "bottom", "categories": {"necessary": true, "analytics": true, "marketing": false, "preferences": false}, "languages": ["en"], "defaultLanguage": "en"}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create branding_settings table
CREATE TABLE IF NOT EXISTS branding_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  logo TEXT,
  header_color TEXT NOT NULL DEFAULT '#1e40af',
  link_color TEXT NOT NULL DEFAULT '#3b82f6',
  button_color TEXT NOT NULL DEFAULT '#2563eb',
  button_text_color TEXT NOT NULL DEFAULT '#ffffff',
  powered_by TEXT DEFAULT '@ConsentHub',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create plans table
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  interval TEXT NOT NULL CHECK (interval IN ('month', 'year')),
  features TEXT[] NOT NULL DEFAULT '{}',
  client_limit INTEGER NOT NULL DEFAULT 5,
  visitor_limit BIGINT NOT NULL DEFAULT 50000,
  is_popular BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'trialing', 'past_due', 'canceled', 'unpaid', 'incomplete')),
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create consent_logs table
CREATE TABLE IF NOT EXISTS consent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  visitor_id TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  country TEXT,
  consent_given BOOLEAN NOT NULL,
  categories JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB,
  ip_address TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE branding_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
-- Fixed policies to avoid infinite recursion
CREATE POLICY "Public can read users"
  ON users
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update themselves"
  ON users
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "SuperAdmin can insert users"
  ON users
  FOR INSERT
  WITH CHECK (true);

-- Create policies for clients table
CREATE POLICY "Public can read clients"
  ON clients
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert their own clients"
  ON clients
  FOR INSERT
  WITH CHECK (admin_id = auth.uid());

CREATE POLICY "Admins can update their own clients"
  ON clients
  FOR UPDATE
  USING (admin_id = auth.uid());

CREATE POLICY "Admins can delete their own clients"
  ON clients
  FOR DELETE
  USING (admin_id = auth.uid());

-- Create policies for branding_settings table
CREATE POLICY "Users can read their own branding settings"
  ON branding_settings
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own branding settings"
  ON branding_settings
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own branding settings"
  ON branding_settings
  FOR UPDATE
  USING (user_id = auth.uid());

-- Create policies for plans table
CREATE POLICY "Everyone can read plans"
  ON plans
  FOR SELECT
  USING (true);

CREATE POLICY "SuperAdmins can manage plans"
  ON plans
  FOR ALL
  USING (true);

-- Create policies for subscriptions table
CREATE POLICY "Users can read their own subscriptions"
  ON subscriptions
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own subscriptions"
  ON subscriptions
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own subscriptions"
  ON subscriptions
  FOR UPDATE
  USING (user_id = auth.uid());

-- Create policies for consent_logs table
CREATE POLICY "Everyone can read consent logs"
  ON consent_logs
  FOR SELECT
  USING (true);

CREATE POLICY "Public can insert consent logs"
  ON consent_logs
  FOR INSERT
  WITH CHECK (true);

-- Create policies for activity_logs table
CREATE POLICY "Everyone can read activity logs"
  ON activity_logs
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own activity logs"
  ON activity_logs
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Insert default plans
INSERT INTO plans (name, price, interval, features, client_limit, visitor_limit, is_popular)
VALUES 
  ('Basic', 29, 'month', ARRAY['Up to 5 client websites', '50,000 monthly visitors', 'Basic analytics', 'Email support', 'Standard consent forms'], 5, 50000, false),
  ('Professional', 79, 'month', ARRAY['Up to 15 client websites', '250,000 monthly visitors', 'Advanced analytics', 'Priority email support', 'Custom consent forms', 'White-labeling'], 15, 250000, true),
  ('Enterprise', 199, 'month', ARRAY['Unlimited client websites', 'Unlimited monthly visitors', 'Enterprise analytics', 'Dedicated support', 'Custom integrations', 'White-labeling', 'SLA guarantees'], 9999999, 9999999, false);

-- Insert yearly plans
INSERT INTO plans (name, price, interval, features, client_limit, visitor_limit, is_popular)
VALUES 
  ('Basic', 290, 'year', ARRAY['Up to 5 client websites', '50,000 monthly visitors', 'Basic analytics', 'Email support', 'Standard consent forms'], 5, 50000, false),
  ('Professional', 790, 'year', ARRAY['Up to 15 client websites', '250,000 monthly visitors', 'Advanced analytics', 'Priority email support', 'Custom consent forms', 'White-labeling'], 15, 250000, true),
  ('Enterprise', 1990, 'year', ARRAY['Unlimited client websites', 'Unlimited monthly visitors', 'Enterprise analytics', 'Dedicated support', 'Custom integrations', 'White-labeling', 'SLA guarantees'], 9999999, 9999999, false);
