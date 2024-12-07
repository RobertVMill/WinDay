-- Create AI tools table
CREATE TABLE IF NOT EXISTS ai_tools (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    use_cases TEXT[] NOT NULL DEFAULT '{}',
    pricing VARCHAR(255) NOT NULL,
    launch_date DATE NOT NULL,
    rating DECIMAL(3,2) NOT NULL DEFAULT 0,
    reviews INTEGER NOT NULL DEFAULT 0,
    url VARCHAR(512) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add some sample data
INSERT INTO ai_tools (name, company, category, description, use_cases, pricing, launch_date, rating, reviews, url) VALUES
(
    'GPT-4',
    'OpenAI',
    'Text Generation',
    'Advanced language model capable of understanding and generating human-like text with improved reasoning capabilities.',
    ARRAY['Content Writing', 'Code Generation', 'Analysis', 'Translation'],
    'Starting at $20/month',
    '2023-03-14',
    4.8,
    1250,
    'https://openai.com/gpt-4'
),
(
    'Claude 2',
    'Anthropic',
    'Text Generation',
    'Advanced AI assistant with strong capabilities in analysis, writing, and coding, with improved context handling.',
    ARRAY['Research', 'Writing', 'Analysis', 'Coding'],
    'Contact for pricing',
    '2023-07-11',
    4.7,
    850,
    'https://anthropic.com/claude'
),
(
    'Midjourney V6',
    'Midjourney',
    'Image Generation',
    'AI image generation tool with photorealistic capabilities and improved understanding of prompts.',
    ARRAY['Design', 'Marketing', 'Concept Art', 'Product Visualization'],
    '$10-30/month',
    '2023-12-14',
    4.9,
    2100,
    'https://midjourney.com'
),
(
    'GitHub Copilot',
    'GitHub',
    'Code Generation',
    'AI pair programmer that helps you write code faster with contextual suggestions.',
    ARRAY['Code Completion', 'Documentation', 'Testing', 'Debugging'],
    '$10/month',
    '2023-11-08',
    4.6,
    3400,
    'https://github.com/features/copilot'
),
(
    'Jasper',
    'Jasper.ai',
    'Marketing',
    'AI content platform for creating marketing copy, social media posts, and long-form content.',
    ARRAY['Copywriting', 'Blog Posts', 'Social Media', 'Ads'],
    'Starting at $49/month',
    '2023-09-20',
    4.5,
    1800,
    'https://jasper.ai'
);

-- Create index for faster searches
CREATE INDEX idx_ai_tools_category ON ai_tools(category);
CREATE INDEX idx_ai_tools_launch_date ON ai_tools(launch_date);
CREATE INDEX idx_ai_tools_rating ON ai_tools(rating);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp
    BEFORE UPDATE ON ai_tools
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();
