/*
  # Fix policy conflicts

  1. Security
    - Drop existing policies that are causing conflicts
    - Create new policies with unique names
  2. Changes
    - Ensure no duplicate policy names
    - Maintain the same security model
*/

-- Drop all potentially conflicting policies to avoid errors
DROP POLICY IF EXISTS "SuperAdmins can manage users" ON users;
DROP POLICY IF EXISTS "SuperAdmins can read all users" ON users;
DROP POLICY IF EXISTS "SuperAdmins can insert users" ON users;
DROP POLICY IF EXISTS "SuperAdmins can update users" ON users;
DROP POLICY IF EXISTS "SuperAdmins can delete users" ON users;
DROP POLICY IF EXISTS "SuperAdmins can read all users by role" ON users;
DROP POLICY IF EXISTS "SuperAdmins can insert users by role" ON users;
DROP POLICY IF EXISTS "SuperAdmins can update users by role" ON users;
DROP POLICY IF EXISTS "SuperAdmins can delete users by role" ON users;
DROP POLICY IF EXISTS "Public can read user data" ON users;
DROP POLICY IF EXISTS "Public can insert users" ON users;
DROP POLICY IF EXISTS "Allow anonymous select" ON users;

-- Create new policies with unique names
CREATE POLICY "Users can view own profile"
  ON users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can modify own profile"
  ON users
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Anonymous users can view users"
  ON users
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anonymous users can create users"
  ON users
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated users can create users"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
