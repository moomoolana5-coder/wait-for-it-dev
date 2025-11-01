-- Create storage bucket for market cover images
INSERT INTO storage.buckets (id, name, public)
VALUES ('market-covers', 'market-covers', true);

-- Allow anyone to view images
CREATE POLICY "Public access to market cover images"
ON storage.objects FOR SELECT
USING (bucket_id = 'market-covers');

-- Allow admins to upload images
CREATE POLICY "Admins can upload market cover images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'market-covers' 
  AND EXISTS (
    SELECT 1 FROM wallet_addresses wa
    JOIN user_roles ur ON wa.user_id = ur.user_id
    WHERE ur.role = 'admin'::app_role
  )
);

-- Allow admins to delete images
CREATE POLICY "Admins can delete market cover images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'market-covers'
  AND EXISTS (
    SELECT 1 FROM wallet_addresses wa
    JOIN user_roles ur ON wa.user_id = ur.user_id
    WHERE ur.role = 'admin'::app_role
  )
);