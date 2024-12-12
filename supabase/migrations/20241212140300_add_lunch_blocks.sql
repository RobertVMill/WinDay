-- Add lunch blocks for each day if they don't exist
INSERT INTO schedule_blocks (day_of_week, phase, activity, notes)
SELECT 
  day_of_week,
  'lunch',
  'Meal',
  ''
FROM generate_series(0, 6) as day_of_week
WHERE NOT EXISTS (
  SELECT 1 FROM schedule_blocks 
  WHERE phase = 'lunch' 
  AND day_of_week = generate_series.day_of_week
);
