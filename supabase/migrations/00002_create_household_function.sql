-- Function to create a household for a user
-- This bypasses RLS using SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.create_household_for_user(
    user_id UUID,
    household_name TEXT
)
RETURNS UUID AS $$
DECLARE
    new_household_id UUID;
BEGIN
    -- Create the household
    INSERT INTO public.households (name, owner_id)
    VALUES (household_name, user_id)
    RETURNING id INTO new_household_id;
    
    -- Update the user's profile to link to this household
    UPDATE public.users
    SET household_id = new_household_id
    WHERE id = user_id;
    
    RETURN new_household_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_household_for_user TO authenticated;

