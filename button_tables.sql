-- ═══════════════════════════════════════════════════════════════════
-- NeuroStrom — Additional Database Tables for Button Functionality
-- Run this in Supabase SQL Editor to create required tables
-- ═══════════════════════════════════════════════════════════════════

-- 1. Manual Entries (Command Center → Manual Entry)
CREATE TABLE IF NOT EXISTS manual_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  revenue DECIMAL(12,2),
  walk_ins INTEGER,
  appointments_count INTEGER,
  product_sales DECIMAL(12,2),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE manual_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert manual entries" ON manual_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view manual entries" ON manual_entries FOR SELECT USING (true);

-- 2. Staff (Human Assets → Add Staff)
CREATE TABLE IF NOT EXISTS staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL,
  branch TEXT NOT NULL DEFAULT 'Soho',
  phone TEXT,
  email TEXT,
  hire_date DATE DEFAULT CURRENT_DATE,
  skills TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Training', 'On Leave', 'Terminated')),
  performance_score DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert staff" ON staff FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view staff" ON staff FOR SELECT USING (true);
CREATE POLICY "Users can update staff" ON staff FOR UPDATE USING (true);

-- 3. Bookings (Neural Schedule → New Booking)
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  service TEXT NOT NULL,
  stylist TEXT,
  booking_date DATE NOT NULL,
  booking_time TEXT NOT NULL,
  duration_hours INTEGER DEFAULT 1,
  notes TEXT,
  status TEXT DEFAULT 'Confirmed' CHECK (status IN ('Confirmed', 'In Progress', 'Completed', 'Cancelled', 'No Show')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert bookings" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view bookings" ON bookings FOR SELECT USING (true);
CREATE POLICY "Users can update bookings" ON bookings FOR UPDATE USING (true);

-- 4. Clients (Stylist CoPilot → Load Client)
CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  visit_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  tier TEXT DEFAULT 'Regular' CHECK (tier IN ('New', 'Regular', 'VIP', 'Platinum')),
  last_visit_date DATE,
  last_service TEXT,
  face_shape TEXT,
  skin_tone TEXT,
  hair_type TEXT,
  allergies TEXT DEFAULT 'None',
  preferences TEXT,
  purchased_products TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view clients" ON clients FOR SELECT USING (true);
CREATE POLICY "Users can insert clients" ON clients FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update clients" ON clients FOR UPDATE USING (true);
