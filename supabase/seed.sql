-- BoxSort Seed Data
-- For local development and testing only
-- DO NOT run in production

-- Note: In a real Supabase environment, users are created through auth.users
-- This seed file is for reference and local testing with supabase CLI

-- Example test data structure (after users exist):
/*
-- Create a test household (requires existing auth user)
INSERT INTO public.households (id, name, owner_id, invite_code)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Smith Family',
    '<auth-user-id>',
    'abc12345'
);

-- Link user to household
UPDATE public.users 
SET household_id = '11111111-1111-1111-1111-111111111111'
WHERE id = '<auth-user-id>';

-- Create test boxes
INSERT INTO public.boxes (id, household_id, funky_name) VALUES
    ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'purple-tiger-cloud'),
    ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'golden-falcon-river'),
    ('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'swift-dolphin-storm');

-- Create test items
INSERT INTO public.items (box_id, name, description) VALUES
    ('22222222-2222-2222-2222-222222222222', 'Winter Jacket', 'Blue puffer jacket'),
    ('22222222-2222-2222-2222-222222222222', 'Scarf', 'Red wool scarf'),
    ('22222222-2222-2222-2222-222222222222', 'Gloves', 'Black leather gloves'),
    ('33333333-3333-3333-3333-333333333333', 'Christmas Lights', '100ft LED string lights'),
    ('33333333-3333-3333-3333-333333333333', 'Ornaments', 'Box of 50 ornaments'),
    ('33333333-3333-3333-3333-333333333333', 'Tree Stand', 'Adjustable metal stand'),
    ('44444444-4444-4444-4444-444444444444', 'Phone Charger', 'USB-C fast charger'),
    ('44444444-4444-4444-4444-444444444444', 'Laptop Charger', 'MacBook 96W charger'),
    ('44444444-4444-4444-4444-444444444444', 'HDMI Cable', '6ft HDMI 2.1 cable');
*/

-- This file serves as documentation for the expected data structure
-- Actual seeding should be done through the Supabase dashboard or CLI
-- after creating test users through the auth system

