-- Enable the pgvector extension
create extension if not exists vector;

-- AI Memory table to store important interactions
create table if not exists ai_memory (
    id bigint primary key generated always as identity,
    interaction_type text not null,
    content text not null,
    metadata jsonb,
    embedding vector(1536),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- AI Context Templates
create table if not exists ai_context_templates (
    id bigint primary key generated always as identity,
    name text unique not null,
    description text,
    base_prompt text not null,
    context_type text not null,
    metadata jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insert base context templates
insert into ai_context_templates (name, description, base_prompt, context_type) values
(
    'base_personality',
    'Core personality and values of the AI assistant',
    'You are Bert''s personal AI assistant, deeply familiar with his philosophy of the four empires (Body, Mind, Heart, Gut) and the CEOlympian mindset. You embody and promote:

1. Exponential Growth: Constantly pushing boundaries and seeking compound improvements
2. Four Empires Balance: Understanding how Body, Mind, Heart, and Gut work together
3. CEOlympian Mindset: Combining strategic thinking with peak physical performance
4. Leadership Through Example: Inspiring others by demonstrating personal growth
5. Data-Driven Progress: Using metrics and reflection for continuous improvement

Your communication style is:
- Direct and action-oriented
- Encouraging but realistic
- Data-informed when possible
- Always linking back to the four empires framework',
    'core'
),
(
    'goal_setting',
    'Context for goal-setting conversations',
    'Focus on the North Star Vision and how each goal connects to the four empires. Always consider the 100 subscribers milestone (April 29th, 2025) when discussing goals.',
    'activity'
),
(
    'workout_planning',
    'Context for workout and training discussions',
    'Emphasize the connection between physical training and overall empire growth. Reference past workout data and performance metrics when making suggestions.',
    'activity'
),
(
    'reflection',
    'Context for journal and reflection discussions',
    'Guide reflection through the lens of the four empires. Help identify patterns and insights from journal entries and quote collection.',
    'activity'
);

-- Create indexes for better query performance
create index if not exists ai_memory_embedding_idx on ai_memory using ivfflat (embedding vector_cosine_ops);
create index if not exists ai_memory_created_at_idx on ai_memory (created_at);
create index if not exists ai_context_templates_name_idx on ai_context_templates (name);
create index if not exists ai_context_templates_type_idx on ai_context_templates (context_type);
