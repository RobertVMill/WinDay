'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface JournalEntry {
  id: number;
  date: string;
  gratitude: string;
  gifts: string;
  strategy: string;
  best_day: string;
  image_url: string;
  workout_notes: string;
  workout_category: string;
  deep_flow_activity: string;
}

function PreviousEntries({ onEntryClick }: { onEntryClick: (entry: JournalEntry) => void }) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver>();

  const fetchEntries = useCallback(async (startIndex: number) => {
    if (!hasMore || isLoading) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .order('date', { ascending: false })
        .range(startIndex, startIndex + 9);

      if (error) throw error;

      if (data) {
        if (data.length < 10) {
          setHasMore(false);
        }
        if (startIndex === 0) {
          setEntries(data);
        } else {
          setEntries(prev => [...prev, ...data]);
        }
      }
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setIsLoading(false);
    }
  }, [hasMore, isLoading]);

  const lastEntryRef = useCallback((node: HTMLDivElement) => {
    if (isLoading) return;
    
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchEntries(entries.length);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore, fetchEntries]);

  useEffect(() => {
    fetchEntries(0);
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [fetchEntries]);

  return (
    <div className="mb-8 font-spaceGrotesk">
      <div 
        onClick={() => setIsVisible(!isVisible)}
        className="flex items-center justify-between cursor-pointer hover:bg-gray-800/50 p-2 rounded-lg transition-colors"
      >
        <h2 className="text-xl font-bold text-white mb-0">Previous Entries</h2>
        <svg 
          className={`w-5 h-5 text-gray-400 transform transition-transform ${isVisible ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      
      {isVisible && (
        <div className="grid grid-cols-1 gap-3 mt-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {entries.map((entry, index) => (
            <div
              key={entry.id}
              ref={index === entries.length - 1 ? lastEntryRef : undefined}
              onClick={() => onEntryClick(entry)}
              className="bg-gray-800/50 p-3 rounded-lg cursor-pointer hover:bg-gray-700/50 transition-colors border border-gray-700/50"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-white/90 text-sm font-medium">
                    {new Date(entry.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-gray-400 text-xs mt-1 line-clamp-2">{entry.gratitude}</p>
                </div>
                {entry.image_url && (
                  <div className="w-12 h-12 ml-3 flex-shrink-0 relative">
                    <Image
                      src={entry.image_url}
                      alt="Journal entry"
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-center py-4">
              <div className="animate-pulse flex space-x-4">
                <div className="h-2 w-2 bg-gray-500 rounded-full"></div>
                <div className="h-2 w-2 bg-gray-500 rounded-full"></div>
                <div className="h-2 w-2 bg-gray-500 rounded-full"></div>
              </div>
            </div>
          )}
          {!hasMore && entries.length > 0 && (
            <div className="text-center text-gray-500 text-sm py-2">
              No more entries to load
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EntryDetail({ entry, onClose }: { entry: JournalEntry; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">
            {new Date(entry.date).toLocaleDateString()}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>
        
        {entry.image_url && (
          <div className="mb-4">
            <Image
              src={entry.image_url}
              alt="Journal entry"
              width={400}
              height={200}
              className="w-full h-64 object-cover rounded"
            />
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Gratitude</h3>
            <p className="text-gray-300">{entry.gratitude}</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white">Gifts Given</h3>
            <p className="text-gray-300">{entry.gifts}</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white">Strategy</h3>
            <p className="text-gray-300">{entry.strategy}</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white">Best Day Vision</h3>
            <p className="text-gray-300">{entry.best_day}</p>
          </div>
          
          {entry.workout_notes && (
            <div>
              <h3 className="text-lg font-semibold text-white">Workout Notes</h3>
              <p className="text-gray-300">{entry.workout_notes}</p>
            </div>
          )}
          
          {entry.workout_category && (
            <div>
              <h3 className="text-lg font-semibold text-white">Workout Category</h3>
              <p className="text-gray-300">{entry.workout_category}</p>
            </div>
          )}
          
          {entry.deep_flow_activity && (
            <div>
              <h3 className="text-lg font-semibold text-white">Deep Flow Activity</h3>
              <p className="text-gray-300">{entry.deep_flow_activity}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function JournalPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    gratitude: '',
    gifts: '',
    strategy: '',
    best_day: '',
    date: new Date().toISOString().split('T')[0],
    image_url: '',
    workout_notes: '',
    workout_category: '',
    deep_flow_activity: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [timestamp, setTimestamp] = useState(Date.now());

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('journal-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('journal-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      let imageUrl = formData.image_url;
      
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }
      
      const { error } = await supabase
        .from('journal_entries')
        .insert([{ ...formData, image_url: imageUrl }]);
        
      if (error) throw error;
      
      alert('Entry saved successfully!');
      // Refresh the entries list by forcing a re-render
      setTimestamp(Date.now());
      setSelectedEntry(null);
      // Clear form except date
      setFormData({
        gratitude: '',
        gifts: '',
        strategy: '',
        best_day: '',
        date: new Date().toISOString().split('T')[0],
        image_url: '',
        workout_notes: '',
        workout_category: '',
        deep_flow_activity: ''
      });
      setImageFile(null);
      if (document.getElementById('image-upload') instanceof HTMLInputElement) {
        (document.getElementById('image-upload') as HTMLInputElement).value = '';
      }
      
      // Navigate to scorecard
      router.push('/scorecard');
    } catch (error) {
      console.error('Error saving entry:', error);
      alert('Error saving entry. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleEntryClick = (entry: JournalEntry) => {
    setSelectedEntry(entry);
  };

  const handleCloseEntry = () => {
    setSelectedEntry(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <PreviousEntries onEntryClick={handleEntryClick} key={timestamp} />
        {selectedEntry && (
          <EntryDetail entry={selectedEntry} onClose={handleCloseEntry} />
        )}
        <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 p-8 rounded-lg shadow">
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              What are you grateful for today?
            </label>
            <textarea
              value={formData.gratitude}
              onChange={(e) => setFormData({ ...formData, gratitude: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              What gifts did you give today?
            </label>
            <textarea
              value={formData.gifts}
              onChange={(e) => setFormData({ ...formData, gifts: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              What&apos;s your strategy for tomorrow?
            </label>
            <textarea
              value={formData.strategy}
              onChange={(e) => setFormData({ ...formData, strategy: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              What would make today your best day?
            </label>
            <textarea
              value={formData.best_day}
              onChange={(e) => setFormData({ ...formData, best_day: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              Upload Image
            </label>
            <input
              type="file"
              onChange={handleImageChange}
              className="mt-1 block w-full text-sm text-gray-300
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-indigo-600 file:text-white
                hover:file:bg-indigo-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              Workout Notes
            </label>
            <textarea
              value={formData.workout_notes}
              onChange={(e) => setFormData({ ...formData, workout_notes: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              Workout Category
            </label>
            <input
              type="text"
              value={formData.workout_category}
              onChange={(e) => setFormData({ ...formData, workout_category: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              Deep Flow Activity
            </label>
            <textarea
              value={formData.deep_flow_activity}
              onChange={(e) => setFormData({ ...formData, deep_flow_activity: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              rows={3}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={uploading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {uploading ? 'Saving...' : 'Save Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
