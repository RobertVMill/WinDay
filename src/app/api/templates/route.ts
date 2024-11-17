import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const templates = await prisma.template.findMany({
      where: {
        OR: [
          { userId: session.user.id },  // User's own templates
          { isPublic: true },          // Public templates
        ],
      },
      include: {
        fields: {
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json(templates)
  } catch (error: any) {
    console.error('Failed to fetch templates:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch templates' },
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
    console.log('Received template data:', body)

    const { name, description, fields } = body

    if (!name?.trim() || !Array.isArray(fields) || fields.length === 0) {
      return NextResponse.json(
        { error: 'Name and at least one field are required' },
        { status: 400 }
      )
    }

    try {
      // Clean up field data before saving
      const cleanFields = fields.map((field: any, index: number) => ({
        name: field.name.trim(),
        label: field.label.trim(),
        type: field.type,
        required: Boolean(field.required),
        order: index,
        default: field.default?.trim() || null,
        placeholder: field.placeholder?.trim() || null,
      }))

      const template = await prisma.template.create({
        data: {
          name: name.trim(),
          description: description?.trim() || '',
          content: '',
          isPublic: false,
          userId: session.user.id,
          fields: {
            create: cleanFields,
          },
        },
        include: {
          fields: {
            orderBy: {
              order: 'asc',
            },
          },
        },
      })

      console.log('Created template:', template)
      return NextResponse.json(template)
    } catch (dbError: any) {
      console.error('Database error:', dbError)
      if (dbError.code === 'P2002') {
        return NextResponse.json(
          { error: 'A template with this name already exists' },
          { status: 400 }
        )
      }
      throw dbError
    }
  } catch (error: any) {
    console.error('Failed to create template:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create template' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('Updating template:', body)

    const { id, name, description, fields, isPublic } = body

    if (!id || !name?.trim() || !Array.isArray(fields) || fields.length === 0) {
      return NextResponse.json(
        { error: 'Id, name, and at least one field are required' },
        { status: 400 }
      )
    }

    // Check if the user owns the template
    const existingTemplate = await prisma.template.findUnique({
      where: { id },
    })

    if (!existingTemplate || existingTemplate.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Template not found or unauthorized' },
        { status: 404 }
      )
    }

    try {
      // Clean up field data before saving
      const cleanFields = fields.map((field: any, index: number) => ({
        name: field.name.trim(),
        label: field.label.trim(),
        type: field.type,
        required: Boolean(field.required),
        order: index,
        default: field.default?.trim() || null,
        placeholder: field.placeholder?.trim() || null,
      }))

      // First, delete existing fields
      await prisma.templateField.deleteMany({
        where: { templateId: id },
      })

      // Then update the template and create new fields
      const template = await prisma.template.update({
        where: { id },
        data: {
          name: name.trim(),
          description: description?.trim() || '',
          isPublic: Boolean(isPublic),
          content: '',
          fields: {
            create: cleanFields,
          },
        },
        include: {
          fields: {
            orderBy: {
              order: 'asc',
            },
          },
        },
      })

      console.log('Updated template:', template)
      return NextResponse.json(template)
    } catch (dbError: any) {
      console.error('Database error:', dbError)
      if (dbError.code === 'P2002') {
        return NextResponse.json(
          { error: 'A template with this name already exists' },
          { status: 400 }
        )
      }
      throw dbError
    }
  } catch (error: any) {
    console.error('Failed to update template:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update template' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
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

    // Check if the user owns the template
    const template = await prisma.template.findUnique({
      where: { id },
    })

    if (!template || template.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Template not found or unauthorized' },
        { status: 404 }
      )
    }

    await prisma.template.delete({
      where: { id },
    })

    console.log('Deleted template:', id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Failed to delete template:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete template' },
      { status: 500 }
    )
  }
}
