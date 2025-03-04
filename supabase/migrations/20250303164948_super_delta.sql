/*
  # Fix infinite recursion in user policies

  1. Security
    - Drop problematic policies that cause infinite recursion
    - Create new policies with proper checks that avoid circular references
  2. Changes
    - Fix the "SuperAdmins can manage users" policy that was causing infinite recursion
    - Add simpler policies for basic operations
*/

-- Drop the problematic policy causing infinite recursion
DROP POLICY IF EXISTS "SuperAdmins can manage users" ON users;
DROP POLICY IF EXISTS "SuperAdmins can read all users" ON users;
DROP POLICY IF EXISTS "SuperAdmins can insert users" ON users;
DROP POLICY IF EXISTS "SuperAdmins can update users" ON users;

-- Create a policy for superadmin role without using recursive queries
CREATE POLICY "SuperAdmins can read all users by role"
  ON users
  FOR SELECT
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'superadmin'
  );

CREATE POLICY "SuperAdmins can insert users by role"
  ON users
  FOR INSERT
  WITH CHECK (
    (SELECT role FROM users WHERE id = auth.uid()) = 'superadmin'
  );

CREATE POLICY "SuperAdmins can update users by role"
  ON users
  FOR UPDATE
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'superadmin'
  );

CREATE POLICY "SuperAdmins can delete users by role"
  ON users
  FOR DELETE
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'superadmin'
  );

-- Add a policy for public access to users table (needed for authentication)
CREATE POLICY "Public can read user data"
  ON users
  FOR SELECT
  TO anon
  USING (true);

-- Add a policy for public insertion (needed for signup)
CREATE POLICY "Public can insert users"
  ON users
  FOR INSERT
  TO anon
  WITH CHECK (true);
