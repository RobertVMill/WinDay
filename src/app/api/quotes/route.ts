import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET all quotes for the current user
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        const quotes = await prisma.quote.findMany({
            where: {
                userId: user.id
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json(quotes)
    } catch (error: any) {
        console.error('Error fetching quotes:', error)
        return NextResponse.json(
            { error: 'Failed to fetch quotes' },
            { status: 500 }
        )
    }
}

// POST new quote
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

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
                userId: user.id
            }
        })

        return NextResponse.json(newQuote)
    } catch (error: any) {
        console.error('Error creating quote:', error)
        return NextResponse.json(
            { error: 'Failed to create quote' },
            { status: 500 }
        )
    }
}

// DELETE quote
export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json(
                { error: 'Quote ID is required' },
                { status: 400 }
            )
        }

        // Verify the quote belongs to the user
        const quote = await prisma.quote.findUnique({
            where: { id }
        })

        if (!quote || quote.userId !== user.id) {
            return NextResponse.json(
                { error: 'Quote not found or unauthorized' },
                { status: 404 }
            )
        }

        await prisma.quote.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Error deleting quote:', error)
        return NextResponse.json(
            { error: 'Failed to delete quote' },
            { status: 500 }
        )
    }
}

// PUT (update) quote
export async function PUT(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json(
                { error: 'Quote ID is required' },
                { status: 400 }
            )
        }

        // Verify the quote belongs to the user
        const existingQuote = await prisma.quote.findUnique({
            where: { id }
        })

        if (!existingQuote || existingQuote.userId !== user.id) {
            return NextResponse.json(
                { error: 'Quote not found or unauthorized' },
                { status: 404 }
            )
        }

        const body = await request.json()
        const { title, quote } = body

        if (!title?.trim() || !quote?.trim()) {
            return NextResponse.json(
                { error: 'Title and quote are required' },
                { status: 400 }
            )
        }

        const updatedQuote = await prisma.quote.update({
            where: { id },
            data: {
                title: title.trim(),
                quote: quote.trim()
            }
        })

        return NextResponse.json(updatedQuote)
    } catch (error: any) {
        console.error('Error updating quote:', error)
        return NextResponse.json(
            { error: 'Failed to update quote' },
            { status: 500 }
        )
    }
}