-- ============================================
-- FIX: Add email column to profiles table
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Add email column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Step 2: Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Step 3: Backfill existing profiles with emails from auth.users
UPDATE profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email IS NULL;

-- Step 4: Update the trigger function to include email
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, avatar_url, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.email
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Create function to sync email on auth.users update
CREATE OR REPLACE FUNCTION handle_user_email_change()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET email = NEW.email, updated_at = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Create trigger for email updates
DROP TRIGGER IF EXISTS on_auth_user_email_changed ON auth.users;
CREATE TRIGGER on_auth_user_email_changed
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW
  WHEN (OLD.email IS DISTINCT FROM NEW.email)
  EXECUTE FUNCTION handle_user_email_change();

-- Step 7: Verify the fix
SELECT 
  p.id,
  p.full_name,
  p.email,
  p.role
FROM profiles p
LIMIT 10;

-- ============================================
-- STORAGE: Ensure product-images bucket exists
-- ============================================
-- Note: Run this in Supabase Dashboard -> Storage -> Create bucket
-- Bucket name: product-images
-- Public: Yes

-- Storage policy for authenticated uploads (run in SQL Editor)
-- First drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their uploads" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their uploads" ON storage.objects;

-- Create storage policies for product-images bucket
CREATE POLICY "Anyone can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can update product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can delete product images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');
