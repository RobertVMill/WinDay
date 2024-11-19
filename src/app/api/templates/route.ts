import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const ADMIN_EMAIL = 'bertmill19@gmail.com'

// Helper function to check if user is admin
async function isAdmin() {
  const session = await getServerSession(authOptions)
  return session?.user?.email === ADMIN_EMAIL
}

// GET all templates (admin only)
export async function GET(request: NextRequest) {
  try {
    if (!await isAdmin()) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const session = await getServerSession(authOptions)
    const user = await prisma.user.findUnique({
      where: { email: session?.user?.email! }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if we're getting a specific template
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id) {
      const template = await prisma.template.findUnique({
        where: { id },
        include: {
          fields: {
            orderBy: {
              order: 'asc'
            }
          }
        }
      })

      if (!template) {
        return NextResponse.json(
          { error: 'Template not found' },
          { status: 404 }
        )
      }

      return NextResponse.json(template)
    }

    // Get all templates
    const templates = await prisma.template.findMany({
      where: {
        userId: user.id
      },
      include: {
        fields: {
          orderBy: {
            order: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(templates)
  } catch (error: any) {
    console.error('Error fetching templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}

// POST new template (admin only)
export async function POST(request: NextRequest) {
  try {
    if (!await isAdmin()) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const session = await getServerSession(authOptions)
    const user = await prisma.user.findUnique({
      where: { email: session?.user?.email! }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { name, description, isPublic, fields } = body

    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Template name is required' },
        { status: 400 }
      )
    }

    // Create template with fields
    const newTemplate = await prisma.template.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        content: JSON.stringify(fields), // Store fields in content for templates page
        isPublic: isPublic ?? false,
        userId: user.id,
        fields: {
          create: fields.map((field: any) => ({
            name: field.name,
            label: field.label,
            type: field.type,
            required: field.required,
            order: field.order
          }))
        }
      },
      include: {
        fields: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    })

    return NextResponse.json(newTemplate)
  } catch (error: any) {
    console.error('Error creating template:', error)
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    )
  }
}

// PUT (update) template (admin only)
export async function PUT(request: NextRequest) {
  try {
    if (!await isAdmin()) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const session = await getServerSession(authOptions)
    const user = await prisma.user.findUnique({
      where: { email: session?.user?.email! }
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
        { error: 'Template ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { name, description, isPublic, fields } = body

    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Template name is required' },
        { status: 400 }
      )
    }

    // Update template and its fields
    const updatedTemplate = await prisma.template.update({
      where: { id },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        content: JSON.stringify(fields), // Store fields in content for templates page
        isPublic: isPublic ?? false,
        fields: {
          deleteMany: {}, // Remove old fields
          create: fields.map((field: any) => ({
            name: field.name,
            label: field.label,
            type: field.type,
            required: field.required,
            order: field.order
          }))
        }
      },
      include: {
        fields: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    })

    return NextResponse.json(updatedTemplate)
  } catch (error: any) {
    console.error('Error updating template:', error)
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    )
  }
}

// DELETE template (admin only)
export async function DELETE(request: NextRequest) {
  try {
    if (!await isAdmin()) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const session = await getServerSession(authOptions)
    const user = await prisma.user.findUnique({
      where: { email: session?.user?.email! }
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
        { error: 'Template ID is required' },
        { status: 400 }
      )
    }

    const template = await prisma.template.findUnique({
      where: { id }
    })

    if (!template || template.userId !== user.id) {
      return NextResponse.json(
        { error: 'Template not found or unauthorized' },
        { status: 404 }
      )
    }

    await prisma.template.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting template:', error)
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    )
  }
}
