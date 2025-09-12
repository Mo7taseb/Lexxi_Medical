-- Reset Tracking Data for Clean Testing
-- Run this in your Supabase SQL Editor

-- Clear all tracking data (maintains table structure)
DELETE FROM section_diffs;
DELETE FROM note_edits;
DELETE FROM note_generations;
DELETE FROM doctor_sessions;
DELETE FROM learning_insights;

-- Reset sequences (optional - for clean IDs)
-- ALTER SEQUENCE IF EXISTS doctor_sessions_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS note_generations_id_seq RESTART WITH 1;

-- Verify cleanup
SELECT 
  'doctor_sessions' as table_name, COUNT(*) as records FROM doctor_sessions
UNION ALL
SELECT 
  'note_generations' as table_name, COUNT(*) as records FROM note_generations
UNION ALL
SELECT 
  'note_edits' as table_name, COUNT(*) as records FROM note_edits
UNION ALL
SELECT 
  'section_diffs' as table_name, COUNT(*) as records FROM section_diffs
UNION ALL
SELECT 
  'learning_insights' as table_name, COUNT(*) as records FROM learning_insights;
