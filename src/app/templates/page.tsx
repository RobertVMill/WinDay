"use client";

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

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
  id: string;
  name: string;
  content: string;
  description: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  fields?: TemplateField[];
}

export default function TemplatesPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [templates, setTemplates] = useState<Template[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [templateFields, setTemplateFields] = useState<TemplateField[]>([])

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    category: '',
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin')
    }
    if (status === 'authenticated') {
      if (session.user?.email !== 'bertmill19@gmail.com') {
        router.push('/')
        return
      }
      fetchTemplates()
    }
  }, [status, session, router])

  const fetchTemplates = async () => {
    try {
      setError(null)
      const response = await fetch('/api/templates')
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to fetch templates')
      }
      const data = await response.json()
      setTemplates(data)
    } catch (error: any) {
      console.error('Failed to fetch templates:', error)
      setError(error.message)
    }
  }

  const handleEdit = (template: Template) => {
    setEditingTemplate(template)
    setFormData({
      title: template.name,
      category: template.description || ''
    })
    try {
      const fields = JSON.parse(template.content);
      setTemplateFields(fields);
    } catch (err) {
      setTemplateFields([]);
      console.error('Error parsing template fields:', err);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const addField = () => {
    setTemplateFields([
      ...templateFields,
      {
        id: Math.random().toString(36).substr(2, 9),
        name: '',
        label: '',
        type: 'text',
        required: false,
        order: templateFields.length
      }
    ]);
  }

  const updateField = (index: number, updates: Partial<TemplateField>) => {
    const newFields = [...templateFields];
    newFields[index] = { ...newFields[index], ...updates };
    setTemplateFields(newFields);
  }

  const removeField = (index: number) => {
    setTemplateFields(templateFields.filter((_, i) => i !== index));
  }

  const moveField = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === templateFields.length - 1)
    ) {
      return;
    }

    const newFields = [...templateFields];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]];
    
    // Update order numbers
    newFields.forEach((field, idx) => {
      field.order = idx;
    });

    setTemplateFields(newFields);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      if (templateFields.some(field => !field.name || !field.label)) {
        throw new Error('All fields must have a name and label');
      }

      const url = editingTemplate 
        ? `/api/templates?id=${editingTemplate.id}`
        : '/api/templates'
      
      const method = editingTemplate ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.title,
          description: formData.category,
          isPublic: false,
          fields: templateFields
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || `Failed to ${editingTemplate ? 'update' : 'create'} template`)
      }

      setFormData({ title: '', category: '' })
      setTemplateFields([])
      setEditingTemplate(null)
      await fetchTemplates()
    } catch (error: any) {
      console.error('Failed to save template:', error)
      setError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this template?')) {
      return
    }

    setError(null)
    try {
      const response = await fetch(`/api/templates?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete template')
      }

      await fetchTemplates()
    } catch (error: any) {
      console.error('Failed to delete template:', error)
      setError(error.message)
    }
  }

  if (status === 'loading') {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </>
    )
  }

  if (session?.user?.email !== 'bertmill19@gmail.com') {
    return null
  }

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Templates</h1>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Add/Edit Template Form */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {editingTemplate ? 'Edit Template' : 'Add New Template'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter a title for your template"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter a category (e.g., 'Journal', 'Meeting')"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Template Fields</h3>
                <button
                  type="button"
                  onClick={addField}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Add Field
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Field Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Label</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Required</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {templateFields.map((field, index) => (
                      <tr key={field.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <button
                              type="button"
                              onClick={() => moveField(index, 'up')}
                              disabled={index === 0}
                              className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              onClick={() => moveField(index, 'down')}
                              disabled={index === templateFields.length - 1}
                              className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                            >
                              ↓
                            </button>
                            <span>{index + 1}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            value={field.name}
                            onChange={(e) => updateField(index, { name: e.target.value })}
                            className="w-full p-2 border rounded-md"
                            placeholder="field_name"
                            required
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            value={field.label}
                            onChange={(e) => updateField(index, { label: e.target.value })}
                            className="w-full p-2 border rounded-md"
                            placeholder="Display Label"
                            required
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={field.type}
                            onChange={(e) => updateField(index, { type: e.target.value as FieldType })}
                            className="w-full p-2 border rounded-md"
                          >
                            <option value="text">Text</option>
                            <option value="boolean">Yes/No</option>
                            <option value="number">Number</option>
                            <option value="date">Date</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => updateField(index, { required: e.target.checked })}
                            className="h-4 w-4 text-blue-600 rounded border-gray-300"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => removeField(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                    {templateFields.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                          No fields added yet. Click "Add Field" to start building your template.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting 
                  ? (editingTemplate ? 'Updating...' : 'Adding...') 
                  : (editingTemplate ? 'Update Template' : 'Add Template')}
              </button>
              {editingTemplate && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingTemplate(null)
                    setFormData({ title: '', category: '' })
                    setTemplateFields([])
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Templates List */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">My Templates</h2>
          {templates.length === 0 ? (
            <p className="text-gray-600 text-center py-10">
              No templates yet. Add your first template above!
            </p>
          ) : (
            <div className="space-y-6">
              {templates.map((template) => (
                <div 
                  key={template.id} 
                  className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {template.name}
                      </h3>
                      {template.description && (
                        <p className="text-sm text-gray-600">
                          Category: {template.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(template)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(template.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <pre className="mt-4 p-4 bg-gray-50 rounded-md overflow-x-auto whitespace-pre-wrap font-mono text-sm">
                    {template.content}
                  </pre>
                  <p className="text-sm text-gray-500 mt-4">
                    Added on {new Date(template.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
