import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('Received journal entry:', body)
    
    if (!body?.templateId || !body?.content) {
      return NextResponse.json(
        { error: 'Invalid journal entry data. Template ID and content are required.' },
        { status: 400 }
      )
    }

    // Verify that the template exists and belongs to the user
    const template = await prisma.template.findUnique({
      where: {
        id: body.templateId,
      },
      include: {
        fields: true,
      },
    })

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    if (template.userId !== session.user.id && !template.isPublic) {
      return NextResponse.json(
        { error: 'Unauthorized to use this template' },
        { status: 403 }
      )
    }

    // Create the journal entry
    const entry = await prisma.journalEntry.create({
      data: {
        date: new Date(),
        content: JSON.stringify(body.content),
        templateId: body.templateId,
        userId: session.user.id,
      },
    })

    console.log('Created journal entry:', entry)
    return NextResponse.json(entry)
  } catch (error: any) {
    console.error('Failed to create journal entry:', error.message || error)
    return NextResponse.json(
      { error: 'Failed to create journal entry' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const entries = await prisma.journalEntry.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        template: {
          include: {
            fields: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    })

    // Parse the content JSON for each entry
    const formattedEntries = entries.map(entry => ({
      ...entry,
      content: JSON.parse(entry.content),
    }))

    return NextResponse.json(formattedEntries)
  } catch (error: any) {
    console.error('Failed to fetch journal entries:', error.message || error)
    return NextResponse.json(
      { error: 'Failed to fetch journal entries' },
      { status: 500 }
    )
  }
}
