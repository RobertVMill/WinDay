import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET all quotes
export async function GET() {
  try {
    const quotes = await prisma.quote.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })
    return NextResponse.json(quotes)
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch quotes' },
      { status: 500 }
    )
  }
}

// POST new quote
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, quote } = body

    if (!title?.trim() || !quote?.trim()) {
      return NextResponse.json(
        { error: 'Title and quote are required' },
        { status: 400 }
      )
    }

    const newQuote = await prisma.quote.create({
      data: {
        title: title.trim(),
        quote: quote.trim(),
      }
    })

    return NextResponse.json(newQuote)
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to create quote' },
      { status: 500 }
    )
  }
}