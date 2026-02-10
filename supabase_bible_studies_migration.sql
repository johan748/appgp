-- ============================================
-- Bible Studies Tables for Supabase
-- ============================================

-- Table: bible_students
-- Stores information about Bible study students
CREATE TABLE IF NOT EXISTS bible_students (
    id TEXT PRIMARY KEY,
    missionary_pair_id TEXT NOT NULL REFERENCES missionary_pairs(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    cedula TEXT NOT NULL,
    birth_date TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    course_name TEXT DEFAULT 'La Fe de Jesús',
    total_lessons INTEGER DEFAULT 30,
    registration_date TEXT NOT NULL,
    status TEXT CHECK (status IN ('ESTUDIANDO', 'TERMINADO', 'BAUTIZADO')) DEFAULT 'ESTUDIANDO',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: bible_study_lessons
-- Tracks completion of individual lessons for each student
CREATE TABLE IF NOT EXISTS bible_study_lessons (
    student_id TEXT NOT NULL REFERENCES bible_students(id) ON DELETE CASCADE,
    lesson_number INTEGER NOT NULL CHECK (lesson_number >= 1 AND lesson_number <= 30),
    completion_date TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (student_id, lesson_number)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_students_missionary_pair ON bible_students(missionary_pair_id);
CREATE INDEX IF NOT EXISTS idx_students_status ON bible_students(status);
CREATE INDEX IF NOT EXISTS idx_students_cedula ON bible_students(cedula);
CREATE INDEX IF NOT EXISTS idx_lessons_student ON bible_study_lessons(student_id);
CREATE INDEX IF NOT EXISTS idx_lessons_completion_date ON bible_study_lessons(completion_date);

-- Enable Row Level Security (RLS)
ALTER TABLE bible_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE bible_study_lessons ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bible_students table
-- Allow all authenticated users to read students
CREATE POLICY "Allow authenticated users to read students"
ON bible_students FOR SELECT
TO authenticated
USING (true);

-- Allow all authenticated users to insert students
CREATE POLICY "Allow authenticated users to insert students"
ON bible_students FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow all authenticated users to update students
CREATE POLICY "Allow authenticated users to update students"
ON bible_students FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow all authenticated users to delete students
CREATE POLICY "Allow authenticated users to delete students"
ON bible_students FOR DELETE
TO authenticated
USING (true);

-- RLS Policies for bible_study_lessons table
-- Allow all authenticated users to read lessons
CREATE POLICY "Allow authenticated users to read lessons"
ON bible_study_lessons FOR SELECT
TO authenticated
USING (true);

-- Allow all authenticated users to insert lessons
CREATE POLICY "Allow authenticated users to insert lessons"
ON bible_study_lessons FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow all authenticated users to update lessons
CREATE POLICY "Allow authenticated users to update lessons"
ON bible_study_lessons FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow all authenticated users to delete lessons
CREATE POLICY "Allow authenticated users to delete lessons"
ON bible_study_lessons FOR DELETE
TO authenticated
USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_students_updated_at
    BEFORE UPDATE ON bible_students
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE bible_students IS 'Stores Bible study students information';
COMMENT ON TABLE bible_study_lessons IS 'Tracks lesson completion for each student';
COMMENT ON COLUMN bible_students.status IS 'Student status: ESTUDIANDO (studying), TERMINADO (finished), BAUTIZADO (baptized)';
COMMENT ON COLUMN bible_study_lessons.lesson_number IS 'Lesson number from 1 to 30';
