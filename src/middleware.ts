import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const JWT_SECRET = process.env.JWT_SECRET || "secret"

async function verifyJWT(token: string): Promise<any> {
  const base64Url = token.split('.')[1]
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  const payload = JSON.parse(atob(base64))
  
  const encoder = new TextEncoder()
  const data = encoder.encode(token.split('.').slice(0, 2).join('.'))
  const signature = token.split('.')[2]
  
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(JWT_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  )
  
  const signatureBytes = Uint8Array.from(atob(signature.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0))
  const isValid = await crypto.subtle.verify(
    'HMAC',
    key,
    signatureBytes,
    data
  )
  
  if (!isValid) throw new Error('Invalid signature')
  return payload
}

export async function middleware(request: NextRequest) {
  // Public paths that don't require authentication
  const publicPaths = ["/login", "/api/auth/login", "/database-error"]

  if (publicPaths.includes(request.nextUrl.pathname)) {
    return NextResponse.next()
  }

  const token = request.cookies.get("token")?.value

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  try {
    // Token'dan tenant bilgisini al
    const decoded = await verifyJWT(token) as {
      userId: string,
      name: string,
      email: string,
      username: string,
      tenantId: string
    }

    // API istekleri için tenant header'ı ekle
    if (request.nextUrl.pathname.startsWith("/api")) {
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set("X-Tenant-ID", decoded.tenantId)

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    }

    return NextResponse.next()
  } catch (error) {
    console.error("Token verification error:", error)
    return NextResponse.redirect(new URL("/login", request.url))
  }
}

// Configure which paths should be processed by this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
} 