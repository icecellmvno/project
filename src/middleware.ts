import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { PrismaClientInitializationError } from "@prisma/client/runtime/library"

export async function middleware(request: NextRequest) {
  try {
    // Veritabanı bağlantısını kontrol et
    const { prisma } = await import("@/lib/prisma")
    await prisma.$connect()
  } catch (error) {
    if (error instanceof PrismaClientInitializationError) {
      // Veritabanı bağlantı hatası durumunda özel hata sayfasına yönlendir
      return NextResponse.redirect(new URL("/database-error", request.url))
    }
  }

  // Public paths that don't require authentication
  const publicPaths = ["/login", "/api/auth/login", "/database-error"]
  
  if (publicPaths.includes(request.nextUrl.pathname)) {
    return NextResponse.next()
  }

  const token = request.cookies.get("token")?.value

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
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