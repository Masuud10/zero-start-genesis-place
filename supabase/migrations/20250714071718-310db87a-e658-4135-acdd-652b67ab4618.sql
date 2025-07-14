-- Drop the old version of create_comprehensive_school function that includes curriculum_type parameter
DROP FUNCTION public.create_comprehensive_school(
    school_name text,
    school_email text,
    school_phone text,
    school_address text,
    school_type text,
    curriculum_type text, -- This identifies the old function
    term_structure text,
    registration_number text,
    year_established integer,
    logo_url text,
    website_url text,
    motto text,
    slogan text,
    owner_name text,
    owner_email text,
    owner_phone text,
    owner_information text,
    principal_name text,
    principal_email text,
    principal_contact text,
    mpesa_paybill_number text,
    mpesa_consumer_key text,
    mpesa_consumer_secret text,
    mpesa_passkey text
);