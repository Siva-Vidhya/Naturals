-- Cleanup and Setup Schema v3
DROP TABLE IF EXISTS public.beauty_passports;
DROP TABLE IF EXISTS public.clients;

-- 1. Clients Table
CREATE TABLE public.clients (
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
CREATE POLICY "Public Manage Clients" ON public.clients FOR ALL USING (true) WITH CHECK (true);

-- 2. Beauty Passports Table
CREATE TABLE public.beauty_passports (
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
    neural_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.beauty_passports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Manage Passports" ON public.beauty_passports FOR ALL USING (true) WITH CHECK (true);
