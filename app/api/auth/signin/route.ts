import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SignJWT } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const CORRECT_PASSWORD = process.env.APP_PASSWORD || 'winday2024';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (password !== CORRECT_PASSWORD) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Create a JWT token using jose
    const token = await new SignJWT({ authenticated: true })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(new TextEncoder().encode(JWT_SECRET));

    // Create the response
    const response = NextResponse.json(
      { success: true },
      { status: 200 }
    );

    // Set the cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Signin error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
