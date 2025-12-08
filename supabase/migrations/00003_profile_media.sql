-- ============================================================================
-- Migration: Profile, Media & Types
-- Feature: 002-profile-media-bauhaus
-- Date: 2025-12-08
-- ============================================================================

-- ============================================================================
-- SCHEMA CHANGES: Add columns to existing tables
-- ============================================================================

-- Add avatar_url to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT NULL;

COMMENT ON COLUMN public.users.avatar_url IS 'URL to profile picture in avatars storage bucket';

-- Add image_url to items table
ALTER TABLE public.items 
ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT NULL;

COMMENT ON COLUMN public.items.image_url IS 'URL to item image in item-images storage bucket';

-- ============================================================================
-- NEW TABLE: types
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL CHECK (char_length(trim(name)) >= 1),
    color VARCHAR(7) NOT NULL DEFAULT '#1E88E5' CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.types IS 'User-generated tags/categories for items';
COMMENT ON COLUMN public.types.name IS 'Display name of the type (unique per household, case-insensitive)';
COMMENT ON COLUMN public.types.color IS 'Hex color code for visual display (#RRGGBB)';

-- ============================================================================
-- NEW TABLE: item_types (junction table)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.item_types (
    item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
    type_id UUID NOT NULL REFERENCES public.types(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (item_id, type_id)
);

COMMENT ON TABLE public.item_types IS 'Many-to-many relationship between items and types';

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_types_household_id ON public.types(household_id);
-- Unique index for case-insensitive type names per household
CREATE UNIQUE INDEX IF NOT EXISTS idx_types_name_lower ON public.types(household_id, LOWER(name));
CREATE INDEX IF NOT EXISTS idx_item_types_type_id ON public.item_types(type_id);

-- ============================================================================
-- TRIGGERS: Auto-update updated_at
-- ============================================================================

CREATE TRIGGER set_types_updated_at
    BEFORE UPDATE ON public.types
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY: types table
-- ============================================================================

ALTER TABLE public.types ENABLE ROW LEVEL SECURITY;

-- Household members can view their types
CREATE POLICY "types_select" ON public.types FOR SELECT
USING (household_id = public.get_my_household_id());

-- Household members can create types
CREATE POLICY "types_insert" ON public.types FOR INSERT
WITH CHECK (household_id = public.get_my_household_id());

-- Household members can update types
CREATE POLICY "types_update" ON public.types FOR UPDATE
USING (household_id = public.get_my_household_id());

-- Household members can delete types
CREATE POLICY "types_delete" ON public.types FOR DELETE
USING (household_id = public.get_my_household_id());

-- ============================================================================
-- ROW LEVEL SECURITY: item_types table
-- ============================================================================

ALTER TABLE public.item_types ENABLE ROW LEVEL SECURITY;

-- Household members can view item-type associations
CREATE POLICY "item_types_select" ON public.item_types FOR SELECT
USING (
    item_id IN (
        SELECT i.id FROM public.items i
        JOIN public.boxes b ON i.box_id = b.id
        WHERE b.household_id = public.get_my_household_id()
    )
);

-- Household members can create associations
CREATE POLICY "item_types_insert" ON public.item_types FOR INSERT
WITH CHECK (
    item_id IN (
        SELECT i.id FROM public.items i
        JOIN public.boxes b ON i.box_id = b.id
        WHERE b.household_id = public.get_my_household_id()
    )
);

-- Household members can delete associations
CREATE POLICY "item_types_delete" ON public.item_types FOR DELETE
USING (
    item_id IN (
        SELECT i.id FROM public.items i
        JOIN public.boxes b ON i.box_id = b.id
        WHERE b.household_id = public.get_my_household_id()
    )
);

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================

-- Create avatars bucket (public read)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars', 
    'avatars', 
    true,
    2097152, -- 2MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create item-images bucket (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'item-images', 
    'item-images', 
    false,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STORAGE POLICIES: avatars bucket
-- ============================================================================

-- Anyone can view avatars (public bucket)
CREATE POLICY "avatars_public_select" ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Users can upload their own avatar
CREATE POLICY "avatars_authenticated_insert" ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can update their own avatar
CREATE POLICY "avatars_authenticated_update" ON storage.objects FOR UPDATE
USING (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can delete their own avatar
CREATE POLICY "avatars_authenticated_delete" ON storage.objects FOR DELETE
USING (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================================================
-- STORAGE POLICIES: item-images bucket
-- ============================================================================

-- Household members can view item images
CREATE POLICY "item_images_household_select" ON storage.objects FOR SELECT
USING (
    bucket_id = 'item-images' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1]::uuid = public.get_my_household_id()
);

-- Household members can upload item images
CREATE POLICY "item_images_household_insert" ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'item-images' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1]::uuid = public.get_my_household_id()
);

-- Household members can update item images
CREATE POLICY "item_images_household_update" ON storage.objects FOR UPDATE
USING (
    bucket_id = 'item-images' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1]::uuid = public.get_my_household_id()
);

-- Household members can delete item images
CREATE POLICY "item_images_household_delete" ON storage.objects FOR DELETE
USING (
    bucket_id = 'item-images' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1]::uuid = public.get_my_household_id()
);

-- ============================================================================
-- ENABLE REALTIME for new tables
-- ============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.types;
ALTER PUBLICATION supabase_realtime ADD TABLE public.item_types;

