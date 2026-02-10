-- Fix broken foreign key constraint on bible_study_lessons
-- The existing constraint references the old 'students' table, but we want it to reference 'bible_students'.

-- 1. Drop the incorrect foreign key constraint
ALTER TABLE bible_study_lessons
DROP CONSTRAINT IF EXISTS bible_study_lessons_student_id_fkey;

-- 2. Add the correct foreign key constraint referencing bible_students
ALTER TABLE bible_study_lessons
ADD CONSTRAINT bible_study_lessons_student_id_fkey
FOREIGN KEY (student_id)
REFERENCES bible_students(id)
ON DELETE CASCADE;

-- 3. Verify the change (Output should show the new definition)
-- SELECT conname, confrelid::regclass 
-- FROM pg_constraint 
-- WHERE conrelid = 'bible_study_lessons'::regclass 
-- AND conname = 'bible_study_lessons_student_id_fkey';
