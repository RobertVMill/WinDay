-- Add focus_taps to store the number of times user needed to refocus
ALTER TABLE schedule_blocks
ADD COLUMN focus_taps INTEGER DEFAULT 0;
