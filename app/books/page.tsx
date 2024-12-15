'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface BookReview {
  id: number;
  title: string;
  author: string;
  date_read: string;
  rating: number;
  key_insights: string;
  impact: string;
  favorite_quotes: string[];
  categories: string[];
}

export default function BooksPage() {
  const [books, setBooks] = useState<BookReview[]>([]);
  const [isAddingBook, setIsAddingBook] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    const { data, error } = await supabase
      .from('book_reviews')
      .select('*')
      .order('date_read', { ascending: false });

    if (error) {
      console.error('Error fetching books:', error);
    } else {
      setBooks(data || []);
    }
  };

  return (
    <div className="min-h-screen bg-[#111827] text-white p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Book Reviews</h1>
            <p className="text-gray-400 mt-2">Track and reflect on your reading journey</p>
          </div>
          <button
            onClick={() => setIsAddingBook(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
          >
            Add Book
          </button>
        </div>

        <div className="grid gap-6">
          {books.map((book) => (
            <div key={book.id} className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold">{book.title}</h2>
                  <p className="text-gray-400">by {book.author}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-500">{'★'.repeat(book.rating)}</span>
                  <span className="text-gray-500">{'★'.repeat(5 - book.rating)}</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-300 mb-1">Key Insights</h3>
                  <p className="text-gray-400 whitespace-pre-wrap">{book.key_insights}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-300 mb-1">Impact</h3>
                  <p className="text-gray-400">{book.impact}</p>
                </div>

                {book.favorite_quotes.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-300 mb-1">Favorite Quotes</h3>
                    <ul className="space-y-2">
                      {book.favorite_quotes.map((quote, index) => (
                        <li key={index} className="text-gray-400 italic">"{quote}"</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex gap-2">
                  {book.categories.map((category) => (
                    <span 
                      key={category}
                      className="px-2 py-1 bg-gray-700/50 rounded-full text-xs text-gray-300"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Book Modal */}
        {isAddingBook && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
            {/* ... Add Book Form ... */}
          </div>
        )}
      </div>
    </div>
  );
} 