-- ==============================================================================
-- VANT STREETWEAR LOOKBOOK — RLS QUICK FIX SCRIPT
-- Run this in your Supabase project's SQL Editor to fix:
-- "new row violates row-level security policy for table products"
-- ==============================================================================

-- 1. Enable RLS (ensures it is on)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_media ENABLE ROW LEVEL SECURITY;

-- 2. PRODUCTS POLICIES (Allow Read, Insert, Update, Delete)
DROP POLICY IF EXISTS "Public users can view all catalog products" ON public.products;
CREATE POLICY "Public users can view all catalog products"
    ON public.products FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow insert for products" ON public.products;
CREATE POLICY "Allow insert for products"
    ON public.products FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update for products" ON public.products;
CREATE POLICY "Allow update for products"
    ON public.products FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow delete for products" ON public.products;
CREATE POLICY "Allow delete for products"
    ON public.products FOR DELETE
    TO anon, authenticated
    USING (true);

-- 3. PRODUCT MEDIA POLICIES (Allow Read, Insert, Update, Delete)
DROP POLICY IF EXISTS "Public users can view all product media" ON public.product_media;
CREATE POLICY "Public users can view all product media"
    ON public.product_media FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow insert for product media" ON public.product_media;
CREATE POLICY "Allow insert for product media"
    ON public.product_media FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update for product media" ON public.product_media;
CREATE POLICY "Allow update for product media"
    ON public.product_media FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow delete for product media" ON public.product_media;
CREATE POLICY "Allow delete for product media"
    ON public.product_media FOR DELETE
    TO anon, authenticated
    USING (true);

-- 4. STORAGE BUCKET POLICIES (For image uploads in 'product-images')
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public Access to product-images" ON storage.objects;
CREATE POLICY "Public Access to product-images"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Authenticated users can upload to product-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow upload to product-images" ON storage.objects;
CREATE POLICY "Allow upload to product-images"
    ON storage.objects FOR INSERT
    TO anon, authenticated
    WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Allow update on product-images" ON storage.objects;
CREATE POLICY "Allow update on product-images"
    ON storage.objects FOR UPDATE
    TO anon, authenticated
    USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Allow delete from product-images" ON storage.objects;
CREATE POLICY "Allow delete from product-images"
    ON storage.objects FOR DELETE
    TO anon, authenticated
    USING (bucket_id = 'product-images');
