/*
  # Fix superadmin role for Armand Morin

  This migration ensures that the user with email 'armandmorin@gmail.com' 
  has the correct 'superadmin' role in the database.
*/

-- Update the role for armandmorin@gmail.com to superadmin
UPDATE users 
SET role = 'superadmin' 
WHERE email = 'armandmorin@gmail.com';

-- If the user doesn't exist yet, insert them with superadmin role
INSERT INTO users (email, name, role)
SELECT 'armandmorin@gmail.com', 'Armand Morin', 'superadmin'
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'armandmorin@gmail.com'
);
