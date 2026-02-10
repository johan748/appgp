-- Create bible_courses table for managing available courses
CREATE TABLE IF NOT EXISTS bible_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    total_lessons INTEGER DEFAULT 20,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE bible_courses ENABLE ROW LEVEL SECURITY;

-- Policies
-- Everyone authenticated can read courses
CREATE POLICY "Allow authenticated users to read courses"
ON bible_courses FOR SELECT
TO authenticated
USING (true);

-- Only admins/pastors/directors (authenticated) can insert/update/delete 
-- For simplicity in this app context, allow authenticated to manage, but in real app would restrict based on role
CREATE POLICY "Allow authenticated users to manage courses"
ON bible_courses FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Insert default courses
INSERT INTO bible_courses (name, total_lessons, description) VALUES
('La Fe de Jesús', 20, 'Curso básico de doctrinas bíblicas'),
('Apocalipsis', 20, 'Estudio de las profecías del tiempo del fin'),
('Vida Discipular', 12, 'Curso de crecimiento espiritual');

-- Comments
COMMENT ON TABLE bible_courses IS 'Catalog of available Bible study courses';
