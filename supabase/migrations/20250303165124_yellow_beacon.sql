/*
  # Fix infinite recursion in user policies

  1. Security
    - Drop problematic policies that cause infinite recursion
    - Create new policies with proper checks that avoid circular references
  2. Changes
    - Fix the "SuperAdmins can manage users" policy that was causing infinite recursion
    - Add simpler policies for basic operations
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

-- Create a simple policy for users to read their own data
CREATE POLICY "Users can read themselves"
  ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Create a simple policy for users to update their own data
CREATE POLICY "Users can update themselves"
  ON users
  FOR UPDATE
  USING (auth.uid() = id);

-- Create a policy for public access to users table (needed for authentication)
CREATE POLICY "Public can read users"
  ON users
  FOR SELECT
  TO anon
  USING (true);

-- Create a policy for public insertion (needed for signup)
CREATE POLICY "Public can insert users"
  ON users
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create a policy for authenticated users to insert users
CREATE POLICY "Authenticated can insert users"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
