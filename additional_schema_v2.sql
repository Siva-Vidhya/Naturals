-- 1. Clients Table
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    email TEXT,
    date_of_birth DATE,
    gender TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Clients Policies
CREATE POLICY "Salon owners can manage their clients." ON public.clients
    FOR ALL USING (true); -- Simplified for now, in production link to salon_id

-- 2. Beauty Passports Table (Enhanced)
CREATE TABLE IF NOT EXISTS public.beauty_passports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    scan_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    face_shape TEXT,
    skin_tone TEXT,
    undertone TEXT,
    skin_analysis JSONB,
    hair_analysis JSONB,
    scalp_analysis JSONB,
    recommendations JSONB,
    confidence FLOAT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.beauty_passports ENABLE ROW LEVEL SECURITY;

-- Beauty Passports Policies
CREATE POLICY "Salon owners can manage beauty passports." ON public.beauty_passports
    FOR ALL USING (true);
