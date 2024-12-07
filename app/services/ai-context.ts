import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

export interface AIContext {
  basePersonality: string;
  relevantGoals: any[];
  relevantQuotes: any[];
  relevantJournalEntries: any[];
  conversationType: 'goal_setting' | 'workout_planning' | 'reflection' | 'general';
}

export class AIContextManager {
  private static instance: AIContextManager;
  private contextCache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  public static getInstance(): AIContextManager {
    if (!AIContextManager.instance) {
      AIContextManager.instance = new AIContextManager();
    }
    return AIContextManager.instance;
  }

  private async getFromCache<T>(key: string): Promise<T | null> {
    const cached = this.contextCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data as T;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.contextCache.set(key, { data, timestamp: Date.now() });
  }

  async getBasePersonality(): Promise<string> {
    const cached = await this.getFromCache<string>('base_personality');
    if (cached) return cached;

    const { data, error } = await supabase
      .from('ai_context_templates')
      .select('base_prompt')
      .eq('name', 'base_personality')
      .single();

    if (error) throw error;
    
    this.setCache('base_personality', data.base_prompt);
    return data.base_prompt;
  }

  async getRelevantQuotes(topic: string, limit: number = 3): Promise<any[]> {
    const { data: quotes } = await supabase
      .from('quotes')
      .select('*')
      .limit(limit);

    return quotes || [];
  }

  async getRelevantGoals(): Promise<any[]> {
    const { data: vision } = await supabase
      .from('north_star_vision')
      .select('*')
      .eq('is_active', true)
      .single();

    const { data: goals } = await supabase
      .from('empire_goals')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    return [vision, ...(goals || [])];
  }

  async getRelevantJournalEntries(topic: string, limit: number = 3): Promise<any[]> {
    // TODO: Implement semantic search once we add embeddings to journal entries
    const { data: entries } = await supabase
      .from('journal_entries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    return entries || [];
  }

  async assembleContext(
    conversationType: AIContext['conversationType'],
    currentPageContext?: string
  ): Promise<AIContext> {
    const [basePersonality, relevantGoals, relevantQuotes, relevantJournalEntries] = 
      await Promise.all([
        this.getBasePersonality(),
        this.getRelevantGoals(),
        this.getRelevantQuotes(currentPageContext || ''),
        this.getRelevantJournalEntries(currentPageContext || '')
      ]);

    return {
      basePersonality,
      relevantGoals,
      relevantQuotes,
      relevantJournalEntries,
      conversationType
    };
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: text,
    });

    return response.data[0].embedding;
  }

  async storeInteraction(
    interactionType: string,
    content: string,
    metadata?: any
  ): Promise<void> {
    const embedding = await this.generateEmbedding(content);

    const { error } = await supabase
      .from('ai_memory')
      .insert({
        interaction_type: interactionType,
        content,
        metadata,
        embedding
      });

    if (error) throw error;
  }
}
