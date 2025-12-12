-- Fix Admin RLS Policies for Nova 3D Lab
-- Run this in your Supabase SQL Editor
-- This script ensures admins can access all data for the dashboard

-- ============================================
-- STEP 1: Recreate the is_admin function with better error handling
-- ============================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Return false if not authenticated
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Get the user's role directly
  SELECT role INTO user_role
  FROM profiles
  WHERE id = auth.uid();
  
  RETURN user_role = 'admin';
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================
-- STEP 2: Drop existing admin policies (to recreate them properly)
-- ============================================

DROP POLICY IF EXISTS "Admins have full access to profiles" ON profiles;
DROP POLICY IF EXISTS "Admins have full access to categories" ON categories;
DROP POLICY IF EXISTS "Admins have full access to materials" ON materials;
DROP POLICY IF EXISTS "Admins have full access to products" ON products;
DROP POLICY IF EXISTS "Admins have full access to orders" ON orders;
DROP POLICY IF EXISTS "Admins have full access to order_items" ON order_items;
DROP POLICY IF EXISTS "Admins have full access to coupons" ON coupons;
DROP POLICY IF EXISTS "Admins have full access to reviews" ON reviews;

-- ============================================
-- STEP 3: Create proper admin SELECT policies
-- These are separate from the USING clause to handle SELECT specifically
-- ============================================

-- Profiles: Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (is_admin());

-- Profiles: Admins can update all profiles
CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (is_admin());

-- Profiles: Admins can delete profiles
CREATE POLICY "Admins can delete profiles" ON profiles
  FOR DELETE USING (is_admin());

-- Categories: Admins have full access
CREATE POLICY "Admins have full access to categories" ON categories
  FOR ALL USING (is_admin());

-- Materials: Admins have full access
CREATE POLICY "Admins have full access to materials" ON materials
  FOR ALL USING (is_admin());

-- Products: Admins can view ALL products (including out of stock)
CREATE POLICY "Admins can view all products" ON products
  FOR SELECT USING (is_admin());

-- Products: Admins can insert products
CREATE POLICY "Admins can insert products" ON products
  FOR INSERT WITH CHECK (is_admin());

-- Products: Admins can update products
CREATE POLICY "Admins can update products" ON products
  FOR UPDATE USING (is_admin());

-- Products: Admins can delete products
CREATE POLICY "Admins can delete products" ON products
  FOR DELETE USING (is_admin());

-- Orders: Admins can view ALL orders
CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT USING (is_admin());

-- Orders: Admins can update orders
CREATE POLICY "Admins can update all orders" ON orders
  FOR UPDATE USING (is_admin());

-- Orders: Admins can delete orders
CREATE POLICY "Admins can delete orders" ON orders
  FOR DELETE USING (is_admin());

-- Order Items: Admins can view all order items
CREATE POLICY "Admins can view all order items" ON order_items
  FOR SELECT USING (is_admin());

-- Coupons: Admins have full access
CREATE POLICY "Admins have full access to coupons" ON coupons
  FOR ALL USING (is_admin());

-- Reviews: Admins can manage all reviews
CREATE POLICY "Admins can manage all reviews" ON reviews
  FOR ALL USING (is_admin());

-- ============================================
-- STEP 4: Verify admin access (run this to test)
-- ============================================

-- Check if your user is admin:
-- SELECT p.id, p.full_name, p.role, u.email 
-- FROM profiles p 
-- JOIN auth.users u ON p.id = u.id 
-- WHERE p.role = 'admin';

-- Or simpler (just profiles):
-- SELECT id, full_name, role FROM profiles WHERE role = 'admin';

-- Test the is_admin function (should return true when logged in as admin):
-- SELECT is_admin();

-- ============================================
-- DONE! The admin dashboard should now work properly.
-- ============================================
