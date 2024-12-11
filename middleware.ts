import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /, /protected-page)
  const path = request.nextUrl.pathname

  // Public paths that don't require authentication
  const isPublicPath = path === '/' || path === '/auth/signin' || path.startsWith('/api/auth')

  // Check if the user is authenticated
  const authToken = request.cookies.get('auth-token')?.value
  let isAuthenticated = false

  if (authToken) {
    try {
      // Verify JWT token
      await jwtVerify(
        authToken,
        new TextEncoder().encode(JWT_SECRET)
      )
      isAuthenticated = true
    } catch (error) {
      // Token is invalid or expired
      isAuthenticated = false
    }
  }

  // If the user is on a public path and is authenticated,
  // redirect them to the home page
  if (isPublicPath && isAuthenticated) {
    return NextResponse.redirect(new URL('/goals', request.url))
  }

  // If the user is not on a public path and is not authenticated,
  // redirect them to the signin page
  if (!isPublicPath && !isAuthenticated) {
    const response = NextResponse.redirect(new URL('/auth/signin', request.url))
    
    // Clear any invalid tokens
    if (authToken) {
      response.cookies.delete('auth-token')
    }
    
    return response
  }

  return NextResponse.next()
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
