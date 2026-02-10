-- Drop policies if they exist to avoid duplication errors
DROP POLICY IF EXISTS "Allow authenticated users to read courses" ON bible_courses;
DROP POLICY IF EXISTS "Allow authenticated users to manage courses" ON bible_courses;

-- Create table if it doesn't exist
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

-- Re-create Policies
CREATE POLICY "Allow authenticated users to read courses"
ON bible_courses FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to manage courses"
ON bible_courses FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Insert default courses safely (if they don't exist by name)
-- Note: 'name' isn't a unique constraint in the schema above, but we can do a check
INSERT INTO bible_courses (name, total_lessons, description)
SELECT 'La Fe de Jesús', 20, 'Curso básico de doctrinas bíblicas'
WHERE NOT EXISTS (SELECT 1 FROM bible_courses WHERE name = 'La Fe de Jesús');

INSERT INTO bible_courses (name, total_lessons, description)
SELECT 'Apocalipsis', 20, 'Estudio de las profecías del tiempo del fin'
WHERE NOT EXISTS (SELECT 1 FROM bible_courses WHERE name = 'Apocalipsis');

INSERT INTO bible_courses (name, total_lessons, description)
SELECT 'Vida Discipular', 12, 'Curso de crecimiento espiritual'
WHERE NOT EXISTS (SELECT 1 FROM bible_courses WHERE name = 'Vida Discipular');
