'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface Quote {
  id: number;
  created_at: string;
  title: string | null;
  quote: string;
}

export default function Quotes() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [newQuote, setNewQuote] = useState({ title: '', quote: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [randomQuote, setRandomQuote] = useState<Quote | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Fetch quotes on component mount
  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuotes(data || []);
      
      // Set a random quote
      if (data && data.length > 0) {
        const randomIndex = Math.floor(Math.random() * data.length);
        setRandomQuote(data[randomIndex]);
      }
    } catch (error) {
      console.error('Error fetching quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { data, error } = await supabase
        .from('quotes')
        .insert([newQuote]);

      if (error) throw error;

      setNewQuote({ title: '', quote: '' });
      fetchQuotes(); // Refresh the quotes list
      setShowAddForm(false);
    } catch (error) {
      console.error('Error saving quote:', error);
      alert('Error saving quote. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getNewRandomQuote = () => {
    if (quotes.length > 0) {
      const randomIndex = Math.floor(Math.random() * quotes.length);
      setRandomQuote(quotes[randomIndex]);
    }
  };

  const filteredQuotes = quotes.filter(quote =>
    quote.quote.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (quote.title && quote.title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-center">Quotes</h1>

      {/* Random Quote Section */}
      {randomQuote && (
        <div className="mb-8 p-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg shadow-lg">
          <p className="text-lg font-medium italic mb-4">"{randomQuote.quote}"</p>
          {randomQuote.title && <p className="text-sm">- {randomQuote.title}</p>}
          <button
            onClick={getNewRandomQuote}
            className="mt-4 bg-white text-blue-500 px-4 py-2 rounded-md hover:bg-blue-50 transition-colors"
          >
            Get Another Quote
          </button>
        </div>
      )}

      {/* Controls */}
      <div className="mb-8 flex flex-wrap gap-4 items-center justify-between">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          {showAddForm ? 'Cancel' : 'Add New Quote'}
        </button>
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search quotes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border rounded-md"
          />
        </div>
        <p className="text-sm text-gray-600">
          Total Quotes: {quotes.length}
        </p>
      </div>

      {/* Add New Quote Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">Add New Quote</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-1">
                Title (optional)
              </label>
              <input
                type="text"
                id="title"
                value={newQuote.title}
                onChange={(e) => setNewQuote(prev => ({ ...prev, title: e.target.value }))}
                className="w-full p-2 border rounded-md bg-white/5"
              />
            </div>
            <div>
              <label htmlFor="quote" className="block text-sm font-medium mb-1">
                Quote
              </label>
              <textarea
                id="quote"
                value={newQuote.quote}
                onChange={(e) => setNewQuote(prev => ({ ...prev, quote: e.target.value }))}
                className="w-full p-2 border rounded-md bg-white/5 min-h-[100px]"
                required
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
            >
              {saving ? 'Saving...' : 'Save Quote'}
            </button>
          </div>
        </form>
      )}

      {/* Quotes List */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold mb-4">All Quotes</h2>
        {loading ? (
          <p className="text-center">Loading quotes...</p>
        ) : filteredQuotes.length === 0 ? (
          <p className="text-center text-gray-500">
            {searchTerm ? 'No quotes found matching your search.' : 'No quotes yet. Add your first one above!'}
          </p>
        ) : (
          <div className="grid gap-4">
            {filteredQuotes.map((quote) => (
              <div key={quote.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-md transition-shadow">
                <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                  "{quote.quote}"
                </p>
                {quote.title && (
                  <p className="text-sm text-gray-500 mt-2">
                    - {quote.title}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
