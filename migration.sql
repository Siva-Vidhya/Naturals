-- ═══════════════════════════════════════════════════════════════════
-- NeuroStrom Enterprise OS — Master Database Migration
-- Run this in the Supabase SQL Editor to enable all features.
-- ═══════════════════════════════════════════════════════════════════

-- 1. Manual Operational Entries
CREATE TABLE IF NOT EXISTS manual_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  revenue DECIMAL(12,2),
  walk_ins INTEGER,
  appointments_count INTEGER,
  product_sales DECIMAL(12,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Staff Directory
CREATE TABLE IF NOT EXISTS staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL,
  branch TEXT NOT NULL DEFAULT 'Soho',
  phone TEXT,
  email TEXT,
  hire_date DATE DEFAULT CURRENT_DATE,
  skills TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Appointment Bookings
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  service TEXT NOT NULL,
  stylist TEXT,
  booking_date DATE NOT NULL,
  booking_time TEXT NOT NULL,
  duration_hours INTEGER DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Resource Allocation Events (Auto-Allocate)
CREATE TABLE IF NOT EXISTS resource_allocations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  insight TEXT NOT NULL,
  impact TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Customer Profiles (Beauty Passport / CoPilot)
CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  visit_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  tier TEXT DEFAULT 'Regular',
  face_shape TEXT,
  skin_tone TEXT,
  hair_type TEXT,
  allergies TEXT DEFAULT 'None',
  preferences TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════
-- Row Level Security (RLS) — Granting Public Access for Demo
-- ═══════════════════════════════════════════════════════════════════

ALTER TABLE manual_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select" ON manual_entries FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON manual_entries FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select" ON staff FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON staff FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select" ON bookings FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON bookings FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select" ON resource_allocations FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON resource_allocations FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select" ON clients FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON clients FOR INSERT WITH CHECK (true);
