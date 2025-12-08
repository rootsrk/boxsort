-- BoxSort Database Schema
-- Supabase PostgreSQL Migration
-- Version: 00001_initial_schema

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLES
-- ============================================================================

-- Households: Groups of users sharing box inventory
CREATE TABLE IF NOT EXISTS public.households (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL CHECK (char_length(trim(name)) > 0),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    invite_code VARCHAR(20) UNIQUE NOT NULL DEFAULT substring(md5(random()::text), 1, 8),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.households IS 'Groups of users sharing the same box inventory';
COMMENT ON COLUMN public.households.invite_code IS 'Short code used in invite links for joining household';

-- Users: Profile data extending Supabase auth.users
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    household_id UUID REFERENCES public.households(id) ON DELETE SET NULL,
    display_name VARCHAR(50) NOT NULL CHECK (char_length(trim(display_name)) > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.users IS 'User profiles extending Supabase auth';
COMMENT ON COLUMN public.users.household_id IS 'NULL until user creates or joins a household';

-- Boxes: Physical storage containers
CREATE TABLE IF NOT EXISTS public.boxes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
    funky_name VARCHAR(100) NOT NULL CHECK (char_length(trim(funky_name)) >= 3),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.boxes IS 'Physical storage containers with auto-generated names';
COMMENT ON COLUMN public.boxes.funky_name IS 'Auto-generated adjective-animal-noun format name';

-- Items: Things stored in boxes
CREATE TABLE IF NOT EXISTS public.items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    box_id UUID NOT NULL REFERENCES public.boxes(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL CHECK (char_length(trim(name)) > 0),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.items IS 'Items stored inside boxes';

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Households
CREATE INDEX IF NOT EXISTS idx_households_owner_id ON public.households(owner_id);
CREATE INDEX IF NOT EXISTS idx_households_invite_code ON public.households(invite_code);

-- Users
CREATE INDEX IF NOT EXISTS idx_users_household_id ON public.users(household_id);

-- Boxes
CREATE INDEX IF NOT EXISTS idx_boxes_household_id ON public.boxes(household_id);
CREATE INDEX IF NOT EXISTS idx_boxes_funky_name ON public.boxes(funky_name);
CREATE INDEX IF NOT EXISTS idx_boxes_created_at ON public.boxes(created_at DESC);

-- Items
CREATE INDEX IF NOT EXISTS idx_items_box_id ON public.items(box_id);
CREATE INDEX IF NOT EXISTS idx_items_name_lower ON public.items(lower(name));
CREATE INDEX IF NOT EXISTS idx_items_created_at ON public.items(created_at DESC);

-- ============================================================================
-- TRIGGERS: Auto-update updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_boxes_updated_at
    BEFORE UPDATE ON public.boxes
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_items_updated_at
    BEFORE UPDATE ON public.items
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- TRIGGERS: Auto-create user profile on auth signup
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, display_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- --------------------------------
-- Households Policies
-- --------------------------------

-- Users can view their own household
CREATE POLICY "Users can view own household"
    ON public.households FOR SELECT
    USING (id = (SELECT household_id FROM public.users WHERE id = auth.uid()));

-- Users can create a household (becomes owner)
CREATE POLICY "Users can create household"
    ON public.households FOR INSERT
    WITH CHECK (owner_id = auth.uid());

-- Owner can update household
CREATE POLICY "Owner can update household"
    ON public.households FOR UPDATE
    USING (owner_id = auth.uid());

-- Owner can delete household (careful!)
CREATE POLICY "Owner can delete household"
    ON public.households FOR DELETE
    USING (owner_id = auth.uid());

-- --------------------------------
-- Users Policies
-- --------------------------------

-- Users can view members of their household
CREATE POLICY "View household members"
    ON public.users FOR SELECT
    USING (
        household_id IS NULL AND id = auth.uid()
        OR household_id = (SELECT household_id FROM public.users WHERE id = auth.uid())
    );

-- Users can update their own profile
CREATE POLICY "Update own profile"
    ON public.users FOR UPDATE
    USING (id = auth.uid());

-- --------------------------------
-- Boxes Policies
-- --------------------------------

-- Household members can view boxes
CREATE POLICY "View household boxes"
    ON public.boxes FOR SELECT
    USING (household_id = (SELECT household_id FROM public.users WHERE id = auth.uid()));

-- Household members can create boxes
CREATE POLICY "Create household boxes"
    ON public.boxes FOR INSERT
    WITH CHECK (household_id = (SELECT household_id FROM public.users WHERE id = auth.uid()));

-- Any household member can update boxes (no ownership)
CREATE POLICY "Update household boxes"
    ON public.boxes FOR UPDATE
    USING (household_id = (SELECT household_id FROM public.users WHERE id = auth.uid()));

-- Any household member can delete boxes (no ownership)
CREATE POLICY "Delete household boxes"
    ON public.boxes FOR DELETE
    USING (household_id = (SELECT household_id FROM public.users WHERE id = auth.uid()));

-- Public can view box by ID (for QR code scanning without auth)
CREATE POLICY "Public can view box by id"
    ON public.boxes FOR SELECT
    USING (true);  -- Will be scoped by query, allows QR landing page

-- --------------------------------
-- Items Policies
-- --------------------------------

-- Household members can view items
CREATE POLICY "View household items"
    ON public.items FOR SELECT
    USING (box_id IN (
        SELECT id FROM public.boxes 
        WHERE household_id = (SELECT household_id FROM public.users WHERE id = auth.uid())
    ));

-- Household members can create items
CREATE POLICY "Create household items"
    ON public.items FOR INSERT
    WITH CHECK (box_id IN (
        SELECT id FROM public.boxes 
        WHERE household_id = (SELECT household_id FROM public.users WHERE id = auth.uid())
    ));

-- Any household member can update items (no ownership)
CREATE POLICY "Update household items"
    ON public.items FOR UPDATE
    USING (box_id IN (
        SELECT id FROM public.boxes 
        WHERE household_id = (SELECT household_id FROM public.users WHERE id = auth.uid())
    ));

-- Any household member can delete items (no ownership)
CREATE POLICY "Delete household items"
    ON public.items FOR DELETE
    USING (box_id IN (
        SELECT id FROM public.boxes 
        WHERE household_id = (SELECT household_id FROM public.users WHERE id = auth.uid())
    ));

-- Public can view items by box ID (for QR code scanning)
CREATE POLICY "Public can view items by box"
    ON public.items FOR SELECT
    USING (true);  -- Will be scoped by query, allows QR landing page

-- ============================================================================
-- REALTIME SUBSCRIPTION PERMISSIONS
-- ============================================================================

-- Allow authenticated users to receive realtime updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.boxes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.items;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to search items across household
CREATE OR REPLACE FUNCTION public.search_items(search_query TEXT)
RETURNS TABLE (
    item_id UUID,
    item_name VARCHAR(200),
    item_description TEXT,
    box_id UUID,
    box_funky_name VARCHAR(100)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.id AS item_id,
        i.name AS item_name,
        i.description AS item_description,
        b.id AS box_id,
        b.funky_name AS box_funky_name
    FROM public.items i
    JOIN public.boxes b ON i.box_id = b.id
    WHERE 
        b.household_id = (SELECT household_id FROM public.users WHERE id = auth.uid())
        AND (
            i.name ILIKE '%' || search_query || '%'
            OR i.description ILIKE '%' || search_query || '%'
            OR b.funky_name ILIKE '%' || search_query || '%'
        )
    ORDER BY 
        CASE WHEN i.name ILIKE search_query || '%' THEN 0 ELSE 1 END,
        i.name
    LIMIT 50;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to regenerate household invite code
CREATE OR REPLACE FUNCTION public.regenerate_invite_code(household_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    new_code TEXT;
BEGIN
    -- Verify caller is owner
    IF NOT EXISTS (
        SELECT 1 FROM public.households 
        WHERE id = household_uuid AND owner_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Only household owner can regenerate invite code';
    END IF;
    
    new_code := substring(md5(random()::text || clock_timestamp()::text), 1, 8);
    
    UPDATE public.households 
    SET invite_code = new_code 
    WHERE id = household_uuid;
    
    RETURN new_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to join household by invite code
CREATE OR REPLACE FUNCTION public.join_household(code TEXT)
RETURNS UUID AS $$
DECLARE
    target_household_id UUID;
BEGIN
    -- Find household by invite code
    SELECT id INTO target_household_id
    FROM public.households
    WHERE invite_code = code;
    
    IF target_household_id IS NULL THEN
        RAISE EXCEPTION 'Invalid invite code';
    END IF;
    
    -- Update user's household
    UPDATE public.users
    SET household_id = target_household_id
    WHERE id = auth.uid();
    
    RETURN target_household_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

