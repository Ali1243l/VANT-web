-- ==============================================================================
-- VANT STREETWEAR LOOKBOOK / DIGITAL CATALOG
-- Supabase PostgreSQL Schema & Row Level Security (RLS) Policies
-- File: supabase/schema.sql
-- ==============================================================================

-- 1. Enable UUID extension if not already present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Clean teardown (optional, for migrations)
-- DROP TABLE IF EXISTS public.product_media CASCADE;
-- DROP TABLE IF EXISTS public.products CASCADE;

-- 3. Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(80) NOT NULL,
    sizes TEXT[] NOT NULL DEFAULT ARRAY['S', 'M', 'L', 'XL'],
    colors TEXT[] NOT NULL DEFAULT ARRAY['Black'],
    fit_details TEXT DEFAULT 'Oversized drop-shoulder streetwear fit. 100% heavyweight cotton.',
    material TEXT DEFAULT '420 GSM French Terry / Brushed Cotton',
    is_exclusive_drop BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for category filtering and title lookup
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products (created_at DESC);

-- 4. Product Media Table (Images & Videos)
CREATE TABLE IF NOT EXISTS public.product_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    media_type VARCHAR(20) NOT NULL CHECK (media_type IN ('image', 'video')),
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for fast media fetching ordered by display_order
CREATE INDEX IF NOT EXISTS idx_product_media_product_id ON public.product_media (product_id, display_order ASC);

-- ==============================================================================
-- 5. Row Level Security (RLS) Policies
-- Public Read Access: Anyone can view catalog products and media
-- Write Access: Allowed for anon and authenticated to support admin management
-- ==============================================================================

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_media ENABLE ROW LEVEL SECURITY;

-- 5.1 PRODUCTS POLICIES
DROP POLICY IF EXISTS "Public users can view all catalog products" ON public.products;
CREATE POLICY "Public users can view all catalog products"
    ON public.products
    FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow insert for products" ON public.products;
CREATE POLICY "Allow insert for products"
    ON public.products
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update for products" ON public.products;
CREATE POLICY "Allow update for products"
    ON public.products
    FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow delete for products" ON public.products;
CREATE POLICY "Allow delete for products"
    ON public.products
    FOR DELETE
    TO anon, authenticated
    USING (true);

-- 5.2 PRODUCT MEDIA POLICIES
DROP POLICY IF EXISTS "Public users can view all product media" ON public.product_media;
CREATE POLICY "Public users can view all product media"
    ON public.product_media
    FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow insert for product media" ON public.product_media;
CREATE POLICY "Allow insert for product media"
    ON public.product_media
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update for product media" ON public.product_media;
CREATE POLICY "Allow update for product media"
    ON public.product_media
    FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow delete for product media" ON public.product_media;
CREATE POLICY "Allow delete for product media"
    ON public.product_media
    FOR DELETE
    TO anon, authenticated
    USING (true);

-- ==============================================================================
-- 6. Initial Seed Data (Streetwear Drops)
-- ==============================================================================

INSERT INTO public.products (id, title, description, price, category, sizes, colors, fit_details, material, is_exclusive_drop)
VALUES
    (
        'a1b2c3d4-e5f6-4a1b-8c2d-000000000001',
        'VANT Heavyweight Boxy Tee — Cobalt Raw',
        'Boxy-cut short sleeve t-shirt crafted from custom-milled 280 GSM combed jersey. Features raw-cut hems, signature cobalt back collar bar-tack, and understated silicone drop logo.',
        65.00,
        'T-Shirts',
        ARRAY['S', 'M', 'L', 'XL'],
        ARRAY['Cobalt Blue', 'Washed Black', 'Bone White'],
        'Cropped boxy torso with exaggerated drop shoulders. Size down for true-to-size look.',
        '280 GSM 100% Combed Compact Cotton',
        true
    ),
    (
        'a1b2c3d4-e5f6-4a1b-8c2d-000000000002',
        'VANT Archival Distressed Zip Hoodie',
        'Double-layered oversized zip hoodie with vintage sun-fade wash and hand-distressed ribbed edges. Custom two-way matte cobalt zip hardware.',
        145.00,
        'Hoodies',
        ARRAY['S', 'M', 'L', 'XL'],
        ARRAY['Washed Onyx', 'Heather Concrete'],
        'Subtle balloon sleeves with relaxed chest profile. Pre-shrunk finish.',
        '480 GSM Heavy French Terry Cotton with brushed thermal interior',
        true
    ),
    (
        'a1b2c3d4-e5f6-4a1b-8c2d-000000000003',
        'VANT Modular Cargo Pant — Shadow Grey',
        'Ergonomic multi-pocket technical cargo pants with adjustable bungee ankle toggles and magnetic flap utility pockets.',
        120.00,
        'Pants',
        ARRAY['28-30 (S)', '31-32 (M)', '33-34 (L)', '36 (XL)'],
        ARRAY['Shadow Grey', 'Matte Carbon'],
        'Relaxed straight-leg with articulated knees and elasticated drawstring waist.',
        'DWR-coated Stretch Nylon-Cotton blend with reinforced ripstop knees',
        false
    ),
    (
        'a1b2c3d4-e5f6-4a1b-8c2d-000000000004',
        'VANT Minimalist Shell Jacket — Glacier',
        'Weather-resistant minimalist outerwear with concealed waterproof taped seams, storm hood visor, and discreet laser-cut breathing eyelets.',
        195.00,
        'Outerwear',
        ARRAY['M', 'L', 'XL'],
        ARRAY['Glacier Graphite', 'Midnight Navy'],
        'Tailored outerwear silhouette designed to layer comfortably over VANT hoodies.',
        '3-Layer Technical Hydro-Shell with 15,000mm waterproof rating',
        true
    )
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 7. Supabase Storage: 'product-images' bucket for lookbook uploads
-- ==============================================================================

-- Create bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage public read policy
DROP POLICY IF EXISTS "Public Access to product-images" ON storage.objects;
CREATE POLICY "Public Access to product-images"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'product-images');

-- Storage insert policy for admin users and lookbook uploads
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


