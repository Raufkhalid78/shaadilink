-- Add is_admin column to profiles for secure role-based access
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- If you want to bootstrap an admin, you can manually update the profiles table:
-- UPDATE public.profiles SET is_admin = true WHERE email = 'info@smartinvites.com.pk';
