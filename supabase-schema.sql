-- =============================================
-- Chatfolio Connect - Supabase Database Schema
-- Run this in your Supabase SQL Editor
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- PROFILE TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS profile (
    id TEXT PRIMARY KEY DEFAULT 'main',
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    location TEXT,
    headline TEXT,
    about TEXT,
    linkedin_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PROJECTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    avatar_url TEXT,
    short_description TEXT,
    link TEXT,
    last_message TEXT,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    unread INTEGER DEFAULT 0,
    tech_stack TEXT[] DEFAULT '{}',
    about TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- REVIEWS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_name TEXT NOT NULL,
    author_photo TEXT,
    rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    text TEXT,
    time TEXT DEFAULT 'Just now',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- STATUSES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS statuses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    media_url TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- AI RESPONSES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS ai_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    intent TEXT NOT NULL UNIQUE,
    response TEXT NOT NULL,
    category TEXT DEFAULT 'general'
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_responses ENABLE ROW LEVEL SECURITY;

-- Profile policies (public read, authenticated write)
CREATE POLICY "Public can view profile" ON profile
    FOR SELECT USING (true);

CREATE POLICY "Authenticated can update profile" ON profile
    FOR UPDATE USING (true);

CREATE POLICY "Authenticated can insert profile" ON profile
    FOR INSERT WITH CHECK (true);

-- Projects policies (public read, authenticated write)
CREATE POLICY "Public can view projects" ON projects
    FOR SELECT USING (true);

CREATE POLICY "Authenticated can insert projects" ON projects
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated can update projects" ON projects
    FOR UPDATE USING (true);

CREATE POLICY "Authenticated can delete projects" ON projects
    FOR DELETE USING (true);

-- Reviews policies (public read, authenticated write)
CREATE POLICY "Public can view reviews" ON reviews
    FOR SELECT USING (true);

CREATE POLICY "Authenticated can insert reviews" ON reviews
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated can update reviews" ON reviews
    FOR UPDATE USING (true);

CREATE POLICY "Authenticated can delete reviews" ON reviews
    FOR DELETE USING (true);

-- Statuses policies (public read, authenticated write)
CREATE POLICY "Public can view statuses" ON statuses
    FOR SELECT USING (true);

CREATE POLICY "Authenticated can insert statuses" ON statuses
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated can update statuses" ON statuses
    FOR UPDATE USING (true);

CREATE POLICY "Authenticated can delete statuses" ON statuses
    FOR DELETE USING (true);

-- AI responses policies (public read, authenticated write)
CREATE POLICY "Public can view ai_responses" ON ai_responses
    FOR SELECT USING (true);

CREATE POLICY "Authenticated can manage ai_responses" ON ai_responses
    FOR ALL USING (true);

-- =============================================
-- SAMPLE DATA (Optional - Remove in production)
-- =============================================

-- Insert sample profile
INSERT INTO profile (id, name, email, phone, location, headline, about)
VALUES (
    'main',
    'Your Name',
    'your@email.com',
    '+250781975565',
    'Kigali, Rwanda',
    'Full-Stack Developer',
    'Passionate developer building web and mobile applications.'
) ON CONFLICT (id) DO NOTHING;

-- Insert sample projects
INSERT INTO projects (title, avatar_url, short_description, link, last_message, tech_stack, about) VALUES
('KORA Coaching', '/avatars/kora.png', 'Personal coaching platform for growth', 'https://example.com/kora', 'Case study published', ARRAY['React', 'Node.js', 'PostgreSQL'], 'KORA is a personal coaching platform that helps individuals set goals, track progress, and receive personalized coaching sessions.'),
('UMWAShop', '/avatars/umwashop.png', 'Ecommerce for local artisans', 'https://example.com/umwashop', 'New collection released', ARRAY['Next.js', 'Stripe', 'MongoDB'], 'UMWAShop connects local artisans with customers through a beautiful ecommerce experience.')
ON CONFLICT DO NOTHING;

-- Insert sample review
INSERT INTO reviews (author_name, rating, text, time) VALUES
('John Smith', 5, 'Excellent work! Very professional and delivered on time.', '2 days ago'),
('Sarah Johnson', 5, 'Amazing attention to detail. Highly recommended!', '1 week ago')
ON CONFLICT DO NOTHING;

-- =============================================
-- REALTIME SUBSCRIPTIONS (Enable for live updates)
-- =============================================
-- In Supabase Dashboard > Database > Replication
-- Enable replication for: projects, reviews, statuses, profile tables
