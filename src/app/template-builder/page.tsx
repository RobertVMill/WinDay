'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';

type FieldType = 'text' | 'boolean' | 'number' | 'date';

interface TemplateField {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  order: number;
}

interface Template {
  name: string;
  description?: string;
  isPublic: boolean;
  fields: TemplateField[];
}

export default function TemplateBuilder() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('id');
  const [template, setTemplate] = useState<Template>({
    name: '',
    description: '',
    isPublic: false,
    fields: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load existing template if editing
  useEffect(() => {
    if (templateId) {
      fetchTemplate(templateId);
    }
  }, [templateId]);

  const fetchTemplate = async (id: string) => {
    try {
      const response = await fetch(`/api/templates?id=${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch template');
      }
      const data = await response.json();
      
      // Get fields from the template's fields array instead of parsing content
      setTemplate({
        name: data.name,
        description: data.description || '',
        isPublic: data.isPublic,
        fields: data.fields.map((field: any) => ({
          id: field.id,
          name: field.name,
          label: field.label,
          type: field.type as FieldType,
          required: field.required,
          order: field.order
        })),
      });
    } catch (error) {
      console.error('Error fetching template:', error);
      setError('Failed to load template');
    }
  };

  const addField = () => {
    const newField: TemplateField = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      label: '',
      type: 'text',
      required: false,
      order: template.fields.length,
    };

    // If this is the first field and no date field exists yet, 
    // automatically add a date field
    if (template.fields.length === 0) {
      const dateField: TemplateField = {
        id: Math.random().toString(36).substr(2, 9),
        name: 'entry_date',
        label: 'Date',
        type: 'date',
        required: true,
        order: 0,
      };
      setTemplate({
        ...template,
        fields: [dateField, newField],
      });
    } else {
      setTemplate({
        ...template,
        fields: [...template.fields, newField],
      });
    }
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
      fields: template.fields.filter((field) => field.id !== id),
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
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newFields[index];
    newFields[index] = newFields[newIndex];
    newFields[newIndex] = temp;

    // Update order numbers
    newFields.forEach((field, idx) => {
      field.order = idx;
    });

    setTemplate({
      ...template,
      fields: newFields,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate fields
      if (template.fields.some((field) => !field.name || !field.label)) {
        throw new Error('All fields must have a name and label');
      }

      const response = await fetch(`/api/templates${templateId ? `?id=${templateId}` : ''}`, {
        method: templateId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: template.name,
          description: template.description,
          isPublic: template.isPublic,
          fields: template.fields,
          content: JSON.stringify(template.fields),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create template');
      }

      router.push('/templates');
    } catch (error: any) {
      console.error('Failed to save template:', error);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Template Builder</h1>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Template Details */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Template Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template Name
                </label>
                <input
                  type="text"
                  value={template.name}
                  onChange={(e) =>
                    setTemplate({ ...template, name: e.target.value })
                  }
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter template name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={template.description}
                  onChange={(e) =>
                    setTemplate({ ...template, description: e.target.value })
                  }
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  placeholder="Enter template description"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={template.isPublic}
                  onChange={(e) =>
                    setTemplate({ ...template, isPublic: e.target.checked })
                  }
                  className="h-4 w-4 text-blue-600 rounded border-gray-300"
                />
                <label htmlFor="isPublic" className="ml-2 text-sm text-gray-700">
                  Make this template public
                </label>
              </div>
            </div>
          </div>

          {/* Fields Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Template Fields</h2>
              <button
                type="button"
                onClick={addField}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Add Field
              </button>
            </div>

            <div className="space-y-4">
              {template.fields.map((field, index) => (
                <div
                  key={field.id}
                  className="border rounded-lg p-4 bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-medium text-gray-900">Field {index + 1}</h3>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => moveField(field.id, 'up')}
                        disabled={index === 0}
                        className={`text-gray-600 hover:text-gray-900 ${
                          index === 0 ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveField(field.id, 'down')}
                        disabled={index === template.fields.length - 1}
                        className={`text-gray-600 hover:text-gray-900 ${
                          index === template.fields.length - 1
                            ? 'opacity-50 cursor-not-allowed'
                            : ''
                        }`}
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => removeField(field.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Field Name
                      </label>
                      <input
                        type="text"
                        value={field.name}
                        onChange={(e) =>
                          updateField(field.id, { name: e.target.value })
                        }
                        className="w-full p-2 border rounded-md"
                        placeholder="e.g., mood_rating"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Field Label
                      </label>
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) =>
                          updateField(field.id, { label: e.target.value })
                        }
                        className="w-full p-2 border rounded-md"
                        placeholder="e.g., How are you feeling today?"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Field Type
                      </label>
                      <select
                        value={field.type}
                        onChange={(e) =>
                          updateField(field.id, {
                            type: e.target.value as FieldType,
                          })
                        }
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="text">Text</option>
                        <option value="boolean">Yes/No</option>
                        <option value="number">Number</option>
                        <option value="date">Date</option>
                      </select>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`required-${field.id}`}
                        checked={field.required}
                        onChange={(e) =>
                          updateField(field.id, { required: e.target.checked })
                        }
                        className="h-4 w-4 text-blue-600 rounded border-gray-300"
                      />
                      <label
                        htmlFor={`required-${field.id}`}
                        className="ml-2 text-sm text-gray-700"
                      >
                        Required field
                      </label>
                    </div>
                  </div>
                </div>
              ))}

              {template.fields.length === 0 && (
                <p className="text-center text-gray-500 py-4">
                  No fields added yet. Click "Add Field" to start building your
                  template.
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Creating Template...' : 'Create Template'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
