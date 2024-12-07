-- Create quotes table
CREATE TABLE IF NOT EXISTS quotes (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    author VARCHAR(255),
    category VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_quotes_updated_at
    BEFORE UPDATE ON quotes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some initial quotes
INSERT INTO quotes (content, author, category) VALUES
('The journey of a thousand miles begins with one step.', 'Lao Tzu', 'wisdom'),
('We are what we repeatedly do. Excellence, then, is not an act, but a habit.', 'Aristotle', 'excellence'),
('The only way to do great work is to love what you do.', 'Steve Jobs', 'passion'),
('Success is not final, failure is not fatal: it is the courage to continue that counts.', 'Winston Churchill', 'perseverance'),
('Be the change you wish to see in the world.', 'Mahatma Gandhi', 'inspiration'),
('The best time to plant a tree was 20 years ago. The second best time is now.', 'Chinese Proverb', 'action'),
('Everything you've ever wanted is on the other side of fear.', 'George Addair', 'courage'),
('The future depends on what you do today.', 'Mahatma Gandhi', 'action'),
('Believe you can and you're halfway there.', 'Theodore Roosevelt', 'belief'),
('It does not matter how slowly you go as long as you do not stop.', 'Confucius', 'perseverance');
