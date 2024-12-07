-- Drop existing policies first
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON milestone_completions;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON books_read;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON diet_tracking;
DROP POLICY IF EXISTS "Enable access to own rows only" ON milestone_completions;
DROP POLICY IF EXISTS "Enable access to own rows only" ON books_read;
DROP POLICY IF EXISTS "Enable access to own rows only" ON diet_tracking;

-- First, alter existing tables to add user_id if they don't have it
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'milestone_completions' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE IF EXISTS milestone_completions 
        ADD COLUMN user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'books_read' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE IF EXISTS books_read 
        ADD COLUMN user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'diet_tracking' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE IF EXISTS diet_tracking 
        ADD COLUMN user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();
    END IF;
END $$;

-- Create milestone_completions table if it doesn't exist
CREATE TABLE IF NOT EXISTS milestone_completions (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    empire TEXT NOT NULL CHECK (empire IN ('body', 'mind', 'heart', 'gut')),
    milestone_name TEXT NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid()
);

-- Add unique constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'milestone_completions_empire_milestone_name_user_id_key'
    ) THEN
        ALTER TABLE milestone_completions
        ADD CONSTRAINT milestone_completions_empire_milestone_name_user_id_key
        UNIQUE(empire, milestone_name, user_id);
    END IF;
END $$;

-- Create books_read table if it doesn't exist
CREATE TABLE IF NOT EXISTS books_read (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    title TEXT NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid()
);

-- Create diet_tracking table if it doesn't exist
CREATE TABLE IF NOT EXISTS diet_tracking (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    clean_eating_score INTEGER CHECK (clean_eating_score BETWEEN 0 AND 10),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid()
);

-- Create indexes after tables are created
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_milestone_completions_completed_at') THEN
        CREATE INDEX idx_milestone_completions_completed_at ON milestone_completions(completed_at);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_milestone_completions_user_id') THEN
        CREATE INDEX idx_milestone_completions_user_id ON milestone_completions(user_id);
    END IF;
END $$;

-- Enable RLS on all tables
ALTER TABLE milestone_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE books_read ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_tracking ENABLE ROW LEVEL SECURITY;

-- Create policies that check user_id
CREATE POLICY "Enable access to own rows only" ON milestone_completions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Enable access to own rows only" ON books_read
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Enable access to own rows only" ON diet_tracking
    FOR ALL USING (auth.uid() = user_id);
