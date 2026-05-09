-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables to allow clean setup (Warning: Data loss)
DROP TABLE IF EXISTS kyc_submissions CASCADE;
DROP TABLE IF EXISTS deals CASCADE;
DROP TABLE IF EXISTS bonds CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 1. Create Profiles / Users Table
CREATE TABLE profiles (
  id UUID PRIMARY KEY, -- Removed FK to auth.users for demo data compatibility
  full_name TEXT,
  role TEXT DEFAULT 'client' CHECK (role IN ('admin', 'manager', 'sub-manager', 'client')),
  mobile TEXT,
  skill_id TEXT,
  manager_id UUID REFERENCES profiles(id),
  kyc_status TEXT DEFAULT 'unverified' CHECK (kyc_status IN ('unverified', 'pending', 'verified', 'rejected')),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger function to create a profile after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    CASE 
      WHEN new.email = 'monaalmamen@gmail.com' THEN 'admin'
      ELSE 'client'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. Create Bonds Table
CREATE TABLE bonds (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  rating TEXT NOT NULL,
  yield_rate TEXT NOT NULL,
  maturity_date TEXT NOT NULL,
  payout TEXT NOT NULL,
  face_value BIGINT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'locked')),
  guaranteed_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Deals Table
CREATE TABLE deals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) NOT NULL,
  bond_id UUID REFERENCES bonds(id) NOT NULL,
  amount BIGINT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'done', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create KYC Submissions Table
CREATE TABLE kyc_submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) NOT NULL,
  doc_type TEXT NOT NULL,
  doc_url TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  encrypted_notes TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Insert Robust Demo Data
-- First, ensure specific users exist in profiles (since triggers handle auth.users)
-- For demo purposes, we'll insert directly into profiles. 
-- In a real app, these would be linked to auth.users IDs.

INSERT INTO profiles (id, full_name, role, mobile, skill_id, kyc_status, avatar_url) VALUES
('57f74b20-1fd1-449c-b854-0768c40127fa', 'Monaal mamen', 'admin', '9999999999', 'ADM-001', 'verified', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mona'),
('d1a2b3c4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', 'Rajesh Kumar', 'manager', '9876543210', 'MGR-001', 'verified', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh'),
('a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', 'Anita Desai', 'manager', '9876543211', 'MGR-002', 'verified', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anita'),
('b1c2d3e4-f5a6-4b5c-8d7e-9f0a1b2c3d4e', 'Vikram Singh', 'sub-manager', '9876543212', 'SUB-001', 'verified', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram'),
('c1d2e3f4-a5b6-4c5d-8e7f-9a0b1c2d3e4f', 'Priya Sharma', 'sub-manager', '9876543213', 'SUB-002', 'verified', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya'),
('e1f2a3b4-c5d6-4e5f-8a7b-9c0d1e2f3a4b', 'Arjun Mehta', 'client', '9876543214', 'CLI-001', 'pending', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun'),
('f1a2b3c4-d5e6-4f5a-8b7c-9d0e1f2a3b4c', 'Sanya Gupta', 'client', '9876543215', 'CLI-002', 'unverified', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sanya'),
('a2b3c4d5-e6f7-4f5a-9a0b-1c2d3e4f5a6b', 'Rohan Verma', 'client', '9876543216', 'CLI-003', 'verified', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan');

-- Update relationships for hierarchy
UPDATE profiles SET manager_id = 'd1a2b3c4-e5f6-4a5b-8c7d-9e0f1a2b3c4d' WHERE full_name IN ('Vikram Singh', 'Arjun Mehta');
UPDATE profiles SET manager_id = 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d' WHERE full_name IN ('Priya Sharma', 'Sanya Gupta');
UPDATE profiles SET manager_id = 'b1c2d3e4-f5a6-4b5c-8d7e-9f0a1b2c3d4e' WHERE full_name = 'Rohan Verma';

-- Insert Demo Bonds
INSERT INTO bonds (name, type, rating, yield_rate, maturity_date, payout, face_value, status, guaranteed_by) VALUES
('Govt Securities 2031', 'Government Bond', 'AAA', '7.25', '2031-06', 'Semi-Annual', 10000, 'active', 'Sovereign guaranteed'),
('HDFC Infrastructure Bond', 'Corporate Bond', 'AA+', '8.10', '2028-03', 'Annual', 5000, 'locked', 'Corporate backed'),
('Municipal Corp 2030', 'Municipal Bond', 'A', '6.75', '2030-12', 'Quarterly', 1000, 'active', 'City guaranteed'),
('RBI Floating Rate Savings', 'Government Bond', 'AAA', '7.88', '2032-09', 'Semi-Annual', 1000, 'active', 'RBI backed');

-- Insert Demo Deals
INSERT INTO deals (profile_id, bond_id, amount, status)
SELECT p.id, b.id, 150000, 'done' FROM profiles p, bonds b WHERE p.full_name = 'Rohan Verma' AND b.name = 'Govt Securities 2031' LIMIT 1;
INSERT INTO deals (profile_id, bond_id, amount, status)
SELECT p.id, b.id, 50000, 'pending' FROM profiles p, bonds b WHERE p.full_name = 'Arjun Mehta' AND b.name = 'RBI Floating Rate Savings' LIMIT 1;
INSERT INTO deals (profile_id, bond_id, amount, status)
SELECT p.id, b.id, 200000, 'done' FROM profiles p, bonds b WHERE p.full_name = 'Sanya Gupta' AND b.name = 'HDFC Infrastructure Bond' LIMIT 1;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bonds ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_submissions ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- Bonds Policies
CREATE POLICY "Bonds are viewable by everyone" ON bonds FOR SELECT USING (true);
CREATE POLICY "Only admins can modify bonds" ON bonds FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Deals Policies
CREATE POLICY "Users can view their own deals" ON deals FOR SELECT USING (auth.uid() = profile_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager', 'sub-manager')));
CREATE POLICY "Users can insert their own deals" ON deals FOR INSERT WITH CHECK (auth.uid() = profile_id);

-- KYC Submissions Policies
CREATE POLICY "Users can view their own KYC" ON kyc_submissions FOR SELECT USING (auth.uid() = profile_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Users can insert their own KYC" ON kyc_submissions FOR INSERT WITH CHECK (auth.uid() = profile_id);
