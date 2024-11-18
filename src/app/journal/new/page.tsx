'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Navbar from '@/components/Navbar'

interface TemplateField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'date';
  required: boolean;
  default?: string | null;
  placeholder?: string | null;
  order: number;
}

interface Template {
  id: string;
  name: string;
  description?: string;
  fields: TemplateField[];
  userId: string;
  isPublic: boolean;
}

export default function NewJournalEntry() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [entry, setEntry] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'authenticated') {
      fetchTemplates()
    } else if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status])

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/templates')
      if (!response.ok) {
        throw new Error('Failed to fetch templates')
      }
      const data = await response.json()
      // Filter for user's templates
      const userTemplates = data.filter((t: Template) => t.userId === session?.user?.id)
      setTemplates(userTemplates)
      
      if (userTemplates.length > 0) {
        setSelectedTemplate(userTemplates[0])
        initializeEntry(userTemplates[0])
      }
    } catch (err) {
      console.error('Error fetching templates:', err)
      setError('Failed to load templates')
    } finally {
      setIsLoading(false)
    }
  }

  const initializeEntry = (template: Template) => {
    const newEntry: Record<string, any> = {}
    template.fields.forEach(field => {
      newEntry[field.name] = field.default || ''
      if (field.type === 'date') {
        newEntry[field.name] = new Date().toISOString().split('T')[0]
      }
    })
    setEntry(newEntry)
  }

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (template) {
      setSelectedTemplate(template)
      initializeEntry(template)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTemplate) return

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/journal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          content: entry,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save journal entry')
      }

      router.push('/journal')
    } catch (err: any) {
      setError(err.message || 'Failed to save journal entry. Please try again.')
      console.error('Error saving journal entry:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </>
    )
  }

  if (!selectedTemplate) {
    return (
      <>
        <Navbar />
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <p className="text-yellow-700">
              You need to create a template first. 
              <a href="/template-builder" className="ml-2 text-yellow-800 underline hover:text-yellow-900">
                Create Template
              </a>
            </p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">New Journal Entry</h1>
          {templates.length > 1 && (
            <select
              value={selectedTemplate.id}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="p-2 border rounded-md text-gray-800"
            >
              {templates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          )}
        </div>
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {selectedTemplate.fields
            .sort((a, b) => a.order - b.order)
            .map(field => (
              <div key={field.id}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    value={entry[field.name] || ''}
                    onChange={(e) => setEntry({ ...entry, [field.name]: e.target.value })}
                    className="w-full p-2 border rounded-md h-32 text-gray-800"
                    placeholder={field.placeholder || ''}
                    required={field.required}
                  />
                ) : (
                  <input
                    type={field.type}
                    value={entry[field.name] || ''}
                    onChange={(e) => setEntry({ ...entry, [field.name]: e.target.value })}
                    className="w-full p-2 border rounded-md text-gray-800"
                    placeholder={field.placeholder || ''}
                    required={field.required}
                  />
                )}
              </div>
            ))}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full ${
              isSubmitting
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white py-2 px-4 rounded-md transition-colors`}
          >
            {isSubmitting ? 'Saving Entry...' : 'Save Entry'}
          </button>
        </form>
      </div>
    </>
  )
}