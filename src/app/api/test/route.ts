import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect()
    console.log('Database connection successful')

    // Test query
    const userCount = await prisma.user.count()
    console.log('User count:', userCount)

    return NextResponse.json({
      status: 'ok',
      message: 'Database connection successful',
      userCount
    })
  } catch (error: any) {
    console.error('Database test error:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    })

    return NextResponse.json({
      status: 'error',
      error: error.message
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
