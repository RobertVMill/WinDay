import { prisma } from '@/lib/db'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

async function getQuotes() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    return []
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })

  if (!user) {
    return []
  }

  const quotes = await prisma.quote.findMany({
    where: {
      userId: user.id
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
  return quotes
}

export default async function QuotesPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/api/auth/signin')
  }

  const quotes = await getQuotes()

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Quotes</h1>
          <Link 
            href="/quotes/new" 
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Add New Quote
          </Link>
        </div>

        {quotes.length === 0 ? (
          <p className="text-gray-600 text-center py-10">
            No quotes yet. Add your first quote!
          </p>
        ) : (
          <div className="space-y-6">
            {quotes.map((quote) => (
              <div 
                key={quote.id} 
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {quote.title}
                </h2>
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
    </>
  )
}