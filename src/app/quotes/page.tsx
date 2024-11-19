'use client';

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

type Quote = {
  id: string;
  title: string;
  quote: string;
  createdAt: string;
}

export default function QuotesPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({ title: '', quote: '' })
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin')
    }
    if (status === 'authenticated') {
      fetchQuotes()
    }
  }, [status, router])

  const fetchQuotes = async () => {
    try {
      setError(null)
      const response = await fetch('/api/quotes')
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to fetch quotes')
      }
      const data = await response.json()
      setQuotes(data)
    } catch (error: any) {
      console.error('Failed to fetch quotes:', error)
      setError(error.message)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const url = editingQuote 
        ? `/api/quotes?id=${editingQuote.id}`
        : '/api/quotes'
      
      const method = editingQuote ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || `Failed to ${editingQuote ? 'update' : 'create'} quote`)
      }

      setFormData({ title: '', quote: '' })
      setEditingQuote(null)
      await fetchQuotes()
    } catch (error: any) {
      console.error('Failed to save quote:', error)
      setError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (quote: Quote) => {
    setEditingQuote(quote)
    setFormData({ title: quote.title, quote: quote.quote })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this quote?')) {
      return
    }

    setError(null)
    try {
      const response = await fetch(`/api/quotes?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete quote')
      }

      await fetchQuotes()
    } catch (error: any) {
      console.error('Failed to delete quote:', error)
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

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Quotes</h1>
        
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
        
        {/* Add/Edit Quote Form */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {editingQuote ? 'Edit Quote' : 'Add New Quote'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-2 border rounded-md"
                placeholder="Enter a title for your quote"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quote
              </label>
              <textarea
                value={formData.quote}
                onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                rows={4}
                className="w-full p-2 border rounded-md"
                placeholder="Enter your quote"
                required
              />
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
                  ? (editingQuote ? 'Updating...' : 'Adding...') 
                  : (editingQuote ? 'Update Quote' : 'Add Quote')}
              </button>
              {editingQuote && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingQuote(null)
                    setFormData({ title: '', quote: '' })
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Quotes List */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">My Quotes</h2>
          {quotes.length === 0 ? (
            <p className="text-gray-600 text-center py-10">
              No quotes yet. Add your first quote above!
            </p>
          ) : (
            <div className="space-y-6">
              {quotes.map((quote) => (
                <div 
                  key={quote.id} 
                  className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {quote.title}
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(quote)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(quote.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4 whitespace-pre-wrap">
                    {quote.quote}
                  </p>
                  <p className="text-sm text-gray-500">
                    Added on {new Date(quote.createdAt).toLocaleDateString()}
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