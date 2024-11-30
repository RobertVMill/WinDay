'use client';

import { useState, useEffect } from 'react';
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-center">Daily Journal</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="date" className="block text-sm font-medium">
            Date
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full p-2 border rounded-md bg-white/5"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="gratitude" className="block text-sm font-medium">
            What I'm grateful for
          </label>
          <textarea
            id="gratitude"
            name="gratitude"
            value={formData.gratitude}
            onChange={handleChange}
            className="w-full p-2 border rounded-md bg-white/5 min-h-[100px]"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="gifts" className="block text-sm font-medium">
            My gifts
          </label>
          <textarea
            id="gifts"
            name="gifts"
            value={formData.gifts}
            onChange={handleChange}
            className="w-full p-2 border rounded-md bg-white/5 min-h-[100px]"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="strategy" className="block text-sm font-medium">
            My strategy
          </label>
          <textarea
            id="strategy"
            name="strategy"
            value={formData.strategy}
            onChange={handleChange}
            className="w-full p-2 border rounded-md bg-white/5 min-h-[100px]"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="deep_flow_activity" className="block text-sm font-medium">
            What will be your deep flow activity today?
          </label>
          <textarea
            id="deep_flow_activity"
            name="deep_flow_activity"
            value={formData.deep_flow_activity}
            onChange={handleChange}
            className="w-full p-2 border rounded-md bg-white/5 min-h-[100px]"
            placeholder="What activity will you dedicate to achieving deep focus and flow state today?"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="best_day" className="block text-sm font-medium">
            My best day
          </label>
          <textarea
            id="best_day"
            name="best_day"
            value={formData.best_day}
            onChange={handleChange}
            className="w-full p-2 border rounded-md bg-white/5 min-h-[100px]"
            required
          />
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium">Workout</label>
          <div className="space-y-2">
            <label htmlFor="workout_category" className="block text-sm font-medium text-gray-500">
              Category
            </label>
            <select
              id="workout_category"
              name="workout_category"
              value={formData.workout_category}
              onChange={handleChange}
              className="w-full p-2 border rounded-md bg-white/5"
            >
              <option value="">Select a category</option>
              <option value="upper_body">Upper Body Strength</option>
              <option value="lower_body">Lower Body Strength</option>
              <option value="endurance">Endurance</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="workout_notes" className="block text-sm font-medium text-gray-500">
              How did your workout go?
            </label>
            <textarea
              id="workout_notes"
              name="workout_notes"
              value={formData.workout_notes}
              onChange={handleChange}
              className="w-full p-2 border rounded-md bg-white/5 min-h-[100px]"
              placeholder="Describe your workout performance, feelings, and achievements..."
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="image-upload" className="block text-sm font-medium">
            Upload an Image
          </label>
          <input
            type="file"
            id="image-upload"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full p-2 border rounded-md bg-white/5"
          />
          {imageFile && (
            <p className="text-sm text-gray-500">Selected: {imageFile.name}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
        >
          {uploading ? 'Saving...' : 'Save and Proceed to Scorecard'}
        </button>
      </form>
    </main>
  );
}
