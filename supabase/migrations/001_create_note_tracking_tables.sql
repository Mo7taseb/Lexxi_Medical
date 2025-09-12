-- Medical Note Change Tracking System
-- Migration: 001_create_note_tracking_tables.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Doctor sessions (anonymous for MVP)
CREATE TABLE doctor_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_anon_id UUID NOT NULL UNIQUE,
  device_fingerprint TEXT,
  first_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_count INTEGER DEFAULT 1,
  
  -- Future auth support
  doctor_user_id TEXT NULL, -- For when we add real auth
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note generations (initial AI output)
CREATE TABLE note_generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Session tracking
  session_id TEXT NOT NULL,
  doctor_anon_id UUID REFERENCES doctor_sessions(doctor_anon_id),
  
  -- Input data (redacted)
  transcript_redacted TEXT NOT NULL,
  note_type TEXT NOT NULL CHECK (note_type IN ('soap', 'consultation', 'progress', 'discharge', 'freeform')),
  language TEXT NOT NULL CHECK (language IN ('ar', 'en')),
  
  -- AI generation info
  generated_note TEXT NOT NULL,
  generated_sections JSONB NOT NULL, -- Structured sections
  generation_source TEXT NOT NULL, -- 'groq', 'openai', 'fallback'
  generation_confidence DECIMAL(3,2),
  model_version TEXT,
  template_used TEXT,
  
  -- Timing
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processing_time_ms INTEGER,
  
  -- Status
  is_edited BOOLEAN DEFAULT FALSE,
  edit_completed_at TIMESTAMP WITH TIME ZONE NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note edits (final doctor output)
CREATE TABLE note_edits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  note_generation_id UUID REFERENCES note_generations(id) ON DELETE CASCADE,
  
  -- Final content
  final_note TEXT NOT NULL,
  final_sections JSONB NOT NULL,
  
  -- Change analysis
  sections_changed TEXT[] DEFAULT '{}',
  total_changes INTEGER DEFAULT 0,
  changes_by_section JSONB DEFAULT '{}', -- {section_id: {added: N, removed: N}}
  
  -- Edit context
  edit_duration_seconds INTEGER,
  character_changes INTEGER DEFAULT 0, -- net change (can be negative)
  word_changes INTEGER DEFAULT 0,
  
  -- Timing
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Section-level diffs (detailed change tracking)
CREATE TABLE section_diffs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  note_edit_id UUID REFERENCES note_edits(id) ON DELETE CASCADE,
  
  -- Section info
  section_id TEXT NOT NULL,
  section_title TEXT,
  section_type TEXT, -- 'subjective', 'objective', 'assessment', 'plan', etc.
  
  -- Content comparison
  original_content TEXT NOT NULL,
  final_content TEXT NOT NULL,
  
  -- Normalized diff (ignore whitespace/punctuation)
  content_diff JSONB, -- Structured diff data
  change_type TEXT CHECK (change_type IN ('addition', 'deletion', 'modification', 'no_change')),
  
  -- Medical context
  medical_terms_changed TEXT[], -- Extracted medical terms that changed
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Learning insights (aggregated patterns)
CREATE TABLE learning_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Pattern identification
  pattern_type TEXT NOT NULL, -- 'common_correction', 'frequent_addition', 'terminology_fix'
  frequency INTEGER DEFAULT 1,
  
  -- Pattern data
  original_pattern TEXT,
  corrected_pattern TEXT,
  context_data JSONB,
  
  -- Categorization
  note_type TEXT,
  language TEXT,
  section_type TEXT,
  
  -- Confidence scoring
  confidence_score DECIMAL(3,2) DEFAULT 0.5,
  
  first_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_doctor_sessions_anon_id ON doctor_sessions(doctor_anon_id);
CREATE INDEX idx_note_generations_doctor_anon_id ON note_generations(doctor_anon_id);
CREATE INDEX idx_note_generations_created_at ON note_generations(created_at);
CREATE INDEX idx_note_generations_note_type ON note_generations(note_type);
CREATE INDEX idx_note_generations_language ON note_generations(language);
CREATE INDEX idx_note_edits_note_generation_id ON note_edits(note_generation_id);
CREATE INDEX idx_section_diffs_note_edit_id ON section_diffs(note_edit_id);
CREATE INDEX idx_section_diffs_section_type ON section_diffs(section_type);
CREATE INDEX idx_learning_insights_pattern_type ON learning_insights(pattern_type);
CREATE INDEX idx_learning_insights_frequency ON learning_insights(frequency DESC);

-- RLS (Row Level Security) policies for future auth
ALTER TABLE doctor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_edits ENABLE ROW LEVEL SECURITY;
ALTER TABLE section_diffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_insights ENABLE ROW LEVEL SECURITY;

-- Anonymous access policy (for MVP)
CREATE POLICY "Allow anonymous access" ON doctor_sessions FOR ALL USING (true);
CREATE POLICY "Allow anonymous access" ON note_generations FOR ALL USING (true);
CREATE POLICY "Allow anonymous access" ON note_edits FOR ALL USING (true);
CREATE POLICY "Allow anonymous access" ON section_diffs FOR ALL USING (true);
CREATE POLICY "Allow anonymous access" ON learning_insights FOR ALL USING (true);
