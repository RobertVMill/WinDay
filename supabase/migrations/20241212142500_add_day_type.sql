-- Add day_type to schedule_blocks
ALTER TABLE schedule_blocks
ADD COLUMN day_type TEXT NOT NULL DEFAULT 'standard_work';

-- Create an enum type for day types
CREATE TYPE day_type AS ENUM ('standard_work', 'standard_vacation', 'random');

-- Add a constraint to ensure day_type is one of the allowed values
ALTER TABLE schedule_blocks
ADD CONSTRAINT schedule_blocks_day_type_check
CHECK (day_type IN ('standard_work', 'standard_vacation', 'random'));
