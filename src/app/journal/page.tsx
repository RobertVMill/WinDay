"use client";

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

interface TemplateField {
  id: string;
  name: string;
  label: string;
  type: string;
  required: boolean;
  order: number;
}

interface Template {
  id: string;
  name: string;
  description?: string;
  fields: TemplateField[];
}

interface JournalEntry {
  id: string;
  date: string;
  content: Record<string, any>;
  template: Template;
  createdAt: string;
  updatedAt: string;
}

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const response = await fetch('/api/journal');
      if (!response.ok) throw new Error('Failed to fetch entries');
      const data = await response.json();
      setEntries(data);
    } catch (err) {
      setError('Failed to load journal entries');
      console.error('Error fetching entries:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatContent = (entry: JournalEntry) => {
    const content = entry.content;
    return (
      <div className="space-y-6">
        {entry.template.fields
          .sort((a, b) => a.order - b.order)
          .map(field => (
            <div key={field.id}>
              <h3 className="text-lg font-medium text-gray-900 mb-2">{field.label}</h3>
              <p className="whitespace-pre-wrap text-gray-900">{content[field.name]}</p>
            </div>
          ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Journal Entries</h1>
          <Link
            href="/journal/new"
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
          >
            New Entry
          </Link>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
            {error}
          </div>
        )}

        {entries.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No journal entries yet. Start writing!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedEntry(entry === selectedEntry ? null : entry)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {new Date(entry.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </h2>
                    <p className="text-sm text-gray-600">Template: {entry.template.name}</p>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(entry.createdAt).toLocaleTimeString()}
                  </span>
                </div>

                {selectedEntry?.id === entry.id && formatContent(entry)}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
