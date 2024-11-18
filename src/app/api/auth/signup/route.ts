import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('Received signup request:', { ...body, password: '[REDACTED]' })

    const { name, email, password } = body

    if (!email || !password) {
      console.log('Missing required fields')
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      console.log('Password too short')
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      console.log('User already exists:', email)
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)
    console.log('Password hashed successfully')

    // Create user
    const user = await prisma.user.create({
      data: {
        name: name || null,
        email,
        password: hashedPassword,
      },
    })
    console.log('User created successfully:', { id: user.id, email: user.email })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      user: userWithoutPassword,
      message: 'User created successfully'
    })
  } catch (error: any) {
    console.error('Error in signup:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    })
    
    // Check for Prisma-specific errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'This email is already registered' },
        { status: 400 }
      )
    }

    // Check for database connection errors
    if (error.code === 'P1001' || error.code === 'P1002') {
      return NextResponse.json(
        { error: 'Unable to connect to the database. Please try again later.' },
        { status: 503 }
      )
    }

    // Generic error response
    return NextResponse.json(
      { error: 'Something went wrong during signup. Please try again.' },
      { status: 500 }
    )
  }
}
