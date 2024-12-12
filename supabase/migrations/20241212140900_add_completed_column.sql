-- Add completed column to schedule_blocks
ALTER TABLE schedule_blocks
ADD COLUMN completed BOOLEAN DEFAULT FALSE;
