/*
  # Fix user policies

  This migration fixes issues with conflicting policies by creating new policies with unique names
  that don't cause recursion or conflicts.
*/

-- Check if policies exist before dropping them
DO $$
BEGIN
  -- Drop policies if they exist
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can read themselves') THEN
    DROP POLICY "Users can read themselves" ON users;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can read users') THEN
    DROP POLICY "Public can read users" ON users;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can insert users') THEN
    DROP POLICY "Public can insert users" ON users;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated can insert users') THEN
    DROP POLICY "Authenticated can insert users" ON users;
  END IF;
END
$$;

-- Create new policies with unique names
CREATE POLICY "user_self_read_policy"
  ON users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "user_self_update_policy"
  ON users
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "public_read_users_policy"
  ON users
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "public_insert_users_policy"
  ON users
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "authenticated_insert_users_policy"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
