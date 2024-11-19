import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET all quotes for the current user
export async function GET() {
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
        return NextResponse.json(
            { error: 'Failed to fetch quotes' },
            { status: 500 }
        )
    }
}

// POST new quote
export async function POST(request: Request) {
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
        return NextResponse.json(
            { error: 'Failed to create quote' },
            { status: 500 }
        )
    }
}