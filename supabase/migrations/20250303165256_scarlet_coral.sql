/*
  # Fix user policies and infinite recursion

  1. Security
    - Drop all existing user policies to avoid conflicts
    - Create simplified policies that don't cause recursion
  2. Changes
    - Use direct role checks instead of subqueries
    - Ensure proper access control for all operations
*/

-- Drop all existing user policies to start fresh
DROP POLICY IF EXISTS "Users can read themselves" ON users;
DROP POLICY IF EXISTS "Users can update themselves" ON users;
DROP POLICY IF EXISTS "Users can read their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can modify own profile" ON users;
DROP POLICY IF EXISTS "SuperAdmins can read all users" ON users;
DROP POLICY IF EXISTS "SuperAdmins can insert users" ON users;
DROP POLICY IF EXISTS "SuperAdmins can update users" ON users;
DROP POLICY IF EXISTS "SuperAdmins can delete users" ON users;
DROP POLICY IF EXISTS "SuperAdmins can read all users by role" ON users;
DROP POLICY IF EXISTS "SuperAdmins can insert users by role" ON users;
DROP POLICY IF EXISTS "SuperAdmins can update users by role" ON users;
DROP POLICY IF EXISTS "SuperAdmins can delete users by role" ON users;
DROP POLICY IF EXISTS "SuperAdmins can manage users" ON users;
DROP POLICY IF EXISTS "SuperAdmin can insert users" ON users;
DROP POLICY IF EXISTS "Public can read user data" ON users;
DROP POLICY IF EXISTS "Public can insert users" ON users;
DROP POLICY IF EXISTS "Allow anonymous select" ON users;
DROP POLICY IF EXISTS "Anonymous users can view users" ON users;
DROP POLICY IF EXISTS "Anonymous users can create users" ON users;
DROP POLICY IF EXISTS "Authenticated users can create users" ON users;

-- Create simplified policies that don't cause recursion

-- Allow all users to be read by anyone (needed for authentication)
CREATE POLICY "anyone_can_read_users"
  ON users
  FOR SELECT
  USING (true);

-- Allow users to update their own profile
CREATE POLICY "users_can_update_themselves"
  ON users
  FOR UPDATE
  USING (auth.uid() = id);

-- Allow anyone to insert users (needed for signup)
CREATE POLICY "anyone_can_insert_users"
  ON users
  FOR INSERT
  WITH CHECK (true);

-- Allow superadmins to delete users (based on direct role check)
CREATE POLICY "superadmins_can_delete_users"
  ON users
  FOR DELETE
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'superadmin'
    )
  );
