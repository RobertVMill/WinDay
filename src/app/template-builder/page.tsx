'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

interface TemplateField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'textarea';
  required: boolean;
  order: number;
  default?: string;
  placeholder?: string;
}

interface Template {
  name: string;
  description?: string;
  fields: TemplateField[];
}

export default function TemplateBuilder() {
  const router = useRouter();
  const [template, setTemplate] = useState<Template>({
    name: '',
    description: '',
    fields: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addField = () => {
    const newField: TemplateField = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      label: '',
      type: 'text',
      required: false,
      order: template.fields.length,
    };
    setTemplate({
      ...template,
      fields: [...template.fields, newField],
    });
  };

  const updateField = (id: string, updates: Partial<TemplateField>) => {
    setTemplate({
      ...template,
      fields: template.fields.map((field) =>
        field.id === id ? { ...field, ...updates } : field
      ),
    });
  };

  const removeField = (id: string) => {
    setTemplate({
      ...template,
      fields: template.fields
        .filter((field) => field.id !== id)
        .map((field, index) => ({ ...field, order: index })),
    });
  };

  const moveField = (id: string, direction: 'up' | 'down') => {
    const index = template.fields.findIndex((field) => field.id === id);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === template.fields.length - 1)
    ) {
      return;
    }

    const newFields = [...template.fields];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newFields[index], newFields[swapIndex]] = [
      newFields[swapIndex],
      newFields[index],
    ];

    setTemplate({
      ...template,
      fields: newFields.map((field, index) => ({ ...field, order: index })),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validate fields
    if (!template.name.trim()) {
      setError('Template name is required');
      setIsSubmitting(false);
      return;
    }

    if (template.fields.length === 0) {
      setError('At least one field is required');
      setIsSubmitting(false);
      return;
    }

    // Validate each field
    const invalidFields = template.fields.filter(
      (field) => !field.name.trim() || !field.label.trim()
    );
    if (invalidFields.length > 0) {
      setError('All fields must have a name and label');
      setIsSubmitting(false);
      return;
    }

    // Clean up field data
    const cleanTemplate = {
      ...template,
      fields: template.fields.map((field, index) => ({
        name: field.name.trim(),
        label: field.label.trim(),
        type: field.type,
        required: Boolean(field.required),
        order: index,
        default: field.default?.trim() || null,
        placeholder: field.placeholder?.trim() || null,
      })),
    };

    try {
      console.log('Sending template data:', cleanTemplate);
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanTemplate),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create template');
      }

      router.push('/templates');
    } catch (err: any) {
      console.error('Error creating template:', err);
      setError(err.message || 'Failed to create template. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Template</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template Name
            </label>
            <input
              type="text"
              value={template.name}
              onChange={(e) =>
                setTemplate({ ...template, name: e.target.value })
              }
              className="w-full p-2 border rounded-md text-gray-900"
              placeholder="Daily Journal, Weekly Review, etc."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={template.description}
              onChange={(e) =>
                setTemplate({ ...template, description: e.target.value })
              }
              className="w-full p-2 border rounded-md text-gray-900"
              placeholder="What is this template for?"
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Fields</h2>
              <button
                type="button"
                onClick={addField}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Add Field
              </button>
            </div>

            {template.fields.map((field) => (
              <div
                key={field.id}
                className="bg-white p-4 rounded-lg border-2 border-gray-200 relative"
              >
                <div className="absolute top-2 right-2 flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <button
                      type="button"
                      onClick={() => moveField(field.id, 'up')}
                      disabled={field.order === 0}
                      className="p-1 px-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 bg-gray-50 rounded"
                      title="Move Up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveField(field.id, 'down')}
                      disabled={field.order === template.fields.length - 1}
                      className="p-1 px-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 bg-gray-50 rounded"
                      title="Move Down"
                    >
                      ↓
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeField(field.id)}
                    className="p-1 px-2 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-md transition-colors"
                    title="Delete Field"
                  >
                    Delete
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Field Name
                    </label>
                    <input
                      type="text"
                      value={field.name}
                      onChange={(e) =>
                        updateField(field.id, { name: e.target.value })
                      }
                      className="w-full p-2 border rounded-md text-gray-900"
                      placeholder="gratitude_list"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Display Label
                    </label>
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) =>
                        updateField(field.id, { label: e.target.value })
                      }
                      className="w-full p-2 border rounded-md text-gray-900"
                      placeholder="What are you grateful for?"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Field Type
                    </label>
                    <select
                      value={field.type}
                      onChange={(e) =>
                        updateField(field.id, {
                          type: e.target.value as TemplateField['type'],
                        })
                      }
                      className="w-full p-2 border rounded-md text-gray-900"
                      required
                    >
                      <option value="text">Short Text</option>
                      <option value="textarea">Long Text</option>
                      <option value="number">Number</option>
                      <option value="date">Date</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Value
                    </label>
                    <input
                      type="text"
                      value={field.default || ''}
                      onChange={(e) =>
                        updateField(field.id, { default: e.target.value })
                      }
                      className="w-full p-2 border rounded-md text-gray-900"
                      placeholder="Optional default value"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Placeholder
                    </label>
                    <input
                      type="text"
                      value={field.placeholder || ''}
                      onChange={(e) =>
                        updateField(field.id, { placeholder: e.target.value })
                      }
                      className="w-full p-2 border rounded-md text-gray-900"
                      placeholder="Optional placeholder text"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) =>
                          updateField(field.id, { required: e.target.checked })
                        }
                        className="rounded text-blue-600"
                      />
                      <span className="text-sm text-gray-700">Required Field</span>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full ${
              isSubmitting
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white py-2 px-4 rounded-md transition-colors`}
          >
            {isSubmitting ? 'Creating Template...' : 'Create Template'}
          </button>
        </form>
      </div>
    </>
  );
}
