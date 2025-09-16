-- Grant admin ability to manage products and product images
-- Uses either DB role (user_roles table) OR admin email from JWT for flexibility

-- 1) PRODUCTS: Admins can INSERT/UPDATE/DELETE
CREATE POLICY IF NOT EXISTS "Admins can manage products"
ON public.products
FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR (auth.jwt() ->> 'email') IN ('lovelyseshu@gmail.com')
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR (auth.jwt() ->> 'email') IN ('lovelyseshu@gmail.com')
);

-- 2) STORAGE POLICIES for product images
-- Ensure anyone can read product images
CREATE POLICY IF NOT EXISTS "Anyone can read product images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'product-images');

-- Allow admins to upload (INSERT), replace/update (UPDATE), and delete (DELETE) images in product-images bucket
CREATE POLICY IF NOT EXISTS "Admins can upload product images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' AND (
    has_role(auth.uid(), 'admin'::app_role)
    OR (auth.jwt() ->> 'email') IN ('lovelyseshu@gmail.com')
  )
);

CREATE POLICY IF NOT EXISTS "Admins can update product images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'product-images' AND (
    has_role(auth.uid(), 'admin'::app_role)
    OR (auth.jwt() ->> 'email') IN ('lovelyseshu@gmail.com')
  )
)
WITH CHECK (
  bucket_id = 'product-images' AND (
    has_role(auth.uid(), 'admin'::app_role)
    OR (auth.jwt() ->> 'email') IN ('lovelyseshu@gmail.com')
  )
);

CREATE POLICY IF NOT EXISTS "Admins can delete product images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'product-images' AND (
    has_role(auth.uid(), 'admin'::app_role)
    OR (auth.jwt() ->> 'email') IN ('lovelyseshu@gmail.com')
  )
);
