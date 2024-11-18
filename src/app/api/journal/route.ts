import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const entries = await prisma.entry.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        template: {
          include: {
            fields: {
              orderBy: {
                order: 'asc'
              }
            }
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    })

    return NextResponse.json(entries)
  } catch (error: any) {
    console.error('Failed to fetch entries:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch entries' },
      { status: 500 }
    )
  }
}

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
    const entry = await prisma.entry.create({
      data: {
        date: new Date(),
        content: body.content,
        userId: session.user.id,
        templateId: body.templateId
      },
      include: {
        template: {
          include: {
            fields: {
              orderBy: {
                order: 'asc'
              }
            }
          }
        }
      }
    })

    console.log('Created journal entry:', entry)
    return NextResponse.json(entry)
  } catch (error: any) {
    console.error('Failed to create entry:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create entry' },
      { status: 500 }
    )
  }
}
