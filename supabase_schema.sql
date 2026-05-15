-- NeuroStrom Enterprise OS - Supabase Database Schema
-- Version: 4.0 (Production Ready)

-- 1. Profiles Table (Extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    email TEXT,
    role TEXT DEFAULT 'owner',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." ON public.profiles
    FOR UPDATE USING (auth.uid() = id);


-- 2. Salons Table
CREATE TABLE IF NOT EXISTS public.salons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    salon_name TEXT NOT NULL,
    salon_type TEXT,
    branch_count INTEGER DEFAULT 1,
    location TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(owner_id)
);

-- Enable RLS
ALTER TABLE public.salons ENABLE ROW LEVEL SECURITY;

-- Salons Policies
CREATE POLICY "Users can view their own salons." ON public.salons
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own salons." ON public.salons
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own salons." ON public.salons
    FOR UPDATE USING (auth.uid() = owner_id);


-- 3. Staff Table
CREATE TABLE IF NOT EXISTS public.staff (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE NOT NULL,
    staff_name TEXT NOT NULL,
    role TEXT,
    specialty TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

-- Staff Policies
CREATE POLICY "Users can view staff of their own salons." ON public.staff
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.salons
            WHERE public.salons.id = public.staff.salon_id
            AND public.salons.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage staff of their own salons." ON public.staff
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.salons
            WHERE public.salons.id = public.staff.salon_id
            AND public.salons.owner_id = auth.uid()
        )
    );


-- 4. Customers Table
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    tier TEXT DEFAULT 'Silver',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Customers Policies
CREATE POLICY "Salon owners can manage their customers." ON public.customers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.salons
            WHERE public.salons.id = public.customers.salon_id
            AND public.salons.owner_id = auth.uid()
        )
    );


-- 5. Beauty Passports Table
CREATE TABLE IF NOT EXISTS public.beauty_passports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
    stylist_id UUID REFERENCES public.profiles(id),
    scan_data JSONB NOT NULL,
    recommendations JSONB NOT NULL,
    analysis_results JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.beauty_passports ENABLE ROW LEVEL SECURITY;

-- Beauty Passports Policies
CREATE POLICY "Salon owners can manage beauty passports." ON public.beauty_passports
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.customers
            JOIN public.salons ON public.salons.id = public.customers.salon_id
            WHERE public.customers.id = public.beauty_passports.customer_id
            AND public.salons.owner_id = auth.uid()
        )
    );


-- 6. Appointments Table
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE NOT NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
    staff_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
    service_name TEXT NOT NULL,
    appointment_time TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    status TEXT DEFAULT 'scheduled', -- scheduled, arrived, in-progress, completed, cancelled
    total_price DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Appointments Policies
CREATE POLICY "Salon owners can manage appointments." ON public.appointments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.salons
            WHERE public.salons.id = public.appointments.salon_id
            AND public.salons.owner_id = auth.uid()
        )
    );


-- 7. Analytics Table
CREATE TABLE IF NOT EXISTS public.analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE NOT NULL,
    metric_name TEXT NOT NULL,
    metric_value DECIMAL(15, 2) NOT NULL,
    dimension TEXT, -- e.g., 'revenue', 'scans', 'satisfaction'
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

-- Analytics Policies
CREATE POLICY "Salon owners can view analytics." ON public.analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.salons
            WHERE public.salons.id = public.analytics.salon_id
            AND public.salons.owner_id = auth.uid()
        )
    );


-- 8. Onboarding Preferences Table
CREATE TABLE IF NOT EXISTS public.onboarding_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    ai_enabled BOOLEAN DEFAULT true,
    ai_personality TEXT,
    notifications_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.onboarding_preferences ENABLE ROW LEVEL SECURITY;

-- Onboarding Preferences Policies
CREATE POLICY "Users can manage their own preferences." ON public.onboarding_preferences
    FOR ALL USING (auth.uid() = user_id);