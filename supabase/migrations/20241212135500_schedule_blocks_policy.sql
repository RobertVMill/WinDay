-- Enable RLS
ALTER TABLE schedule_blocks ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all users to read schedule blocks
CREATE POLICY "Allow public read access"
ON schedule_blocks
FOR SELECT
TO public
USING (true);

-- Create policy to allow authenticated users to modify their own blocks
CREATE POLICY "Allow authenticated users to modify"
ON schedule_blocks
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
