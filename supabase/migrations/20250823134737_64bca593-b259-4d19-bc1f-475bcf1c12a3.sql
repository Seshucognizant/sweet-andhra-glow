-- Update all product image URLs to use correct public paths
UPDATE products 
SET image_url = CASE 
  WHEN image_url = '/src/assets/andhra-sweets-collection.jpg' THEN '/images/andhra-sweets-collection.jpg'
  WHEN image_url = '/src/assets/hero-gulab-jamun.jpg' THEN '/images/hero-gulab-jamun.jpg'
  WHEN image_url = '/src/assets/mysore-pak.jpg' THEN '/images/mysore-pak.jpg'
  WHEN image_url = '/src/assets/pootharekulu.jpg' THEN '/images/pootharekulu.jpg'
  WHEN image_url = '/src/assets/coconut-burfi.jpg' THEN '/images/coconut-burfi.jpg'
  WHEN image_url = '/src/assets/andhra-snacks.jpg' THEN '/images/andhra-snacks.jpg'
  ELSE image_url
END
WHERE image_url LIKE '/src/assets/%';