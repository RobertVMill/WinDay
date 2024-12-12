-- Add meditation_duration to schedule_blocks
ALTER TABLE schedule_blocks
ADD COLUMN meditation_duration INTEGER;
