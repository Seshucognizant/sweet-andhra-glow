-- Safe policy creation with proper EXECUTE quoting

-- 1) PRODUCTS: Admins can manage (ALL)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'products' 
      AND policyname = 'Admins can manage products'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can manage products"\n'
      'ON public.products\n'
      'FOR ALL\n'
      'USING (\n'
      '  has_role(auth.uid(), ''admin''::app_role)\n'
      '  OR (auth.jwt() ->> ''email'') IN (''lovelyseshu@gmail.com'')\n'
      ')\n'
      'WITH CHECK (\n'
      '  has_role(auth.uid(), ''admin''::app_role)\n'
      '  OR (auth.jwt() ->> ''email'') IN (''lovelyseshu@gmail.com'')\n'
      ');';
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
    EXECUTE 'CREATE POLICY "Anyone can read product images"\n'
      'ON storage.objects\n'
      'FOR SELECT\n'
      'USING (bucket_id = ''product-images'');';
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
    EXECUTE 'CREATE POLICY "Admins can upload product images"\n'
      'ON storage.objects\n'
      'FOR INSERT\n'
      'WITH CHECK (\n'
      '  bucket_id = ''product-images'' AND (\n'
      '    has_role(auth.uid(), ''admin''::app_role)\n'
      '    OR (auth.jwt() ->> ''email'') IN (''lovelyseshu@gmail.com'')\n'
      '  )\n'
      ');';
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
    EXECUTE 'CREATE POLICY "Admins can update product images"\n'
      'ON storage.objects\n'
      'FOR UPDATE\n'
      'USING (\n'
      '  bucket_id = ''product-images'' AND (\n'
      '    has_role(auth.uid(), ''admin''::app_role)\n'
      '    OR (auth.jwt() ->> ''email'') IN (''lovelyseshu@gmail.com'')\n'
      '  )\n'
      ')\n'
      'WITH CHECK (\n'
      '  bucket_id = ''product-images'' AND (\n'
      '    has_role(auth.uid(), ''admin''::app_role)\n'
      '    OR (auth.jwt() ->> ''email'') IN (''lovelyseshu@gmail.com'')\n'
      '  )\n'
      ');';
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
    EXECUTE 'CREATE POLICY "Admins can delete product images"\n'
      'ON storage.objects\n'
      'FOR DELETE\n'
      'USING (\n'
      '  bucket_id = ''product-images'' AND (\n'
      '    has_role(auth.uid(), ''admin''::app_role)\n'
      '    OR (auth.jwt() ->> ''email'') IN (''lovelyseshu@gmail.com'')\n'
      '  )\n'
      ');';
  END IF;
END $$;