/*
  # Fix policy conflicts and update schema

  1. New Tables
    - No new tables are created in this migration
  2. Security
    - Drop existing policies that might cause conflicts
    - Recreate policies with proper checks
  3. Changes
    - Fix policy conflicts by dropping and recreating policies
*/

-- Drop potentially conflicting policies to avoid errors
DROP POLICY IF EXISTS "Admins can insert their own clients" ON clients;
DROP POLICY IF EXISTS "Admins can update their own clients" ON clients;
DROP POLICY IF EXISTS "Admins can delete their own clients" ON clients;
DROP POLICY IF EXISTS "Public can read users" ON users;
DROP POLICY IF EXISTS "Users can update themselves" ON users;
DROP POLICY IF EXISTS "SuperAdmin can insert users" ON users;

-- Create policies for users table with fixed names
CREATE POLICY "Users can read themselves"
  ON users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "SuperAdmins can manage users"
  ON users
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'superadmin'
    )
  );

-- Create policies for clients table with fixed names
CREATE POLICY "Admins can create clients"
  ON clients
  FOR INSERT
  WITH CHECK (admin_id = auth.uid());

CREATE POLICY "Admins can modify their clients"
  ON clients
  FOR UPDATE
  USING (admin_id = auth.uid());

CREATE POLICY "Admins can remove their clients"
  ON clients
  FOR DELETE
  USING (admin_id = auth.uid());

-- Add anonymous access policy for public endpoints
CREATE POLICY "Allow anonymous select"
  ON users
  FOR SELECT
  TO anon
  USING (true);

-- Add public access to plans for unauthenticated users
CREATE POLICY "Public can view plans"
  ON plans
  FOR SELECT
  TO anon
  USING (true);
