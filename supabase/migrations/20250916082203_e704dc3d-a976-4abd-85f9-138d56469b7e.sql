-- Safe policy creation with single-line EXECUTE strings

-- 1) PRODUCTS: Admins can manage (ALL)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'products' 
      AND policyname = 'Admins can manage products'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can manage products" ON public.products FOR ALL USING ( has_role(auth.uid(), ''admin''::app_role) OR (auth.jwt() ->> ''email'') IN (''lovelyseshu@gmail.com'') ) WITH CHECK ( has_role(auth.uid(), ''admin''::app_role) OR (auth.jwt() ->> ''email'') IN (''lovelyseshu@gmail.com'') );';
  END IF;
END $$;

-- 2) STORAGE: Anyone can read product images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' 
      AND policyname = 'Anyone can read product images'
  ) THEN
    EXECUTE 'CREATE POLICY "Anyone can read product images" ON storage.objects FOR SELECT USING (bucket_id = ''product-images'');';
  END IF;
END $$;

-- 3) STORAGE: Admins can upload product images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' 
      AND policyname = 'Admins can upload product images'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can upload product images" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = ''product-images'' AND ( has_role(auth.uid(), ''admin''::app_role) OR (auth.jwt() ->> ''email'') IN (''lovelyseshu@gmail.com'') ) );';
  END IF;
END $$;

-- 4) STORAGE: Admins can update product images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' 
      AND policyname = 'Admins can update product images'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can update product images" ON storage.objects FOR UPDATE USING ( bucket_id = ''product-images'' AND ( has_role(auth.uid(), ''admin''::app_role) OR (auth.jwt() ->> ''email'') IN (''lovelyseshu@gmail.com'') ) ) WITH CHECK ( bucket_id = ''product-images'' AND ( has_role(auth.uid(), ''admin''::app_role) OR (auth.jwt() ->> ''email'') IN (''lovelyseshu@gmail.com'') ) );';
  END IF;
END $$;

-- 5) STORAGE: Admins can delete product images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' 
      AND policyname = 'Admins can delete product images'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can delete product images" ON storage.objects FOR DELETE USING ( bucket_id = ''product-images'' AND ( has_role(auth.uid(), ''admin''::app_role) OR (auth.jwt() ->> ''email'') IN (''lovelyseshu@gmail.com'') ) );';
  END IF;
END $$;