'use client';


import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

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

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
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
