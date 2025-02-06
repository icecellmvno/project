import { NextResponse } from "next/server"
import { compare } from "bcryptjs"
import { sign } from "jsonwebtoken"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"

const JWT_SECRET = process.env.JWT_SECRET || "secret"

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json()
    const headersList = await headers()
    const domain = headersList.get("host")?.split(":")[0]

    if (!domain) {
      return NextResponse.json(
        { error: "Geçersiz domain" },
        { status: 400 }
      )
    }

    // Tenant'ı bul
    const tenant = await prisma.tenant.findUnique({
      where: { domain }
    })

    if (!tenant) {
      return NextResponse.json(
        { error: "Bayi bulunamadı" },
        { status: 404 }
      )
    }

    // Kullanıcıyı email veya username ile bul
    const user = await prisma.user.findFirst({
      where: {
        AND: [
          { tenantId: tenant.id },
          {
            OR: [
              { email: username },
              { username: username }
            ]
          }
        ]
      },
      include: {
        tenant: {
          select: {
            credit: true,
            name: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 }
      )
    }

    // Şifreyi kontrol et
    const isValid = await compare(password, user.password)

    if (!isValid) {
      return NextResponse.json(
        { error: "Hatalı şifre" },
        { status: 401 }
      )
    }

    // JWT token oluştur
    const token = sign(
      { 
        userId: user.id,
        name : user.firstName + " " + user.lastName,
        email : user.email,
        username : user.username,
        tenantId: tenant.id 
      },
      JWT_SECRET,
      { expiresIn: "1d" }
    )

    // Hassas bilgileri çıkar
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      token,
      user: userWithoutPassword
    })

  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "Bir hata oluştu" },
      { status: 500 }
    )
  }
} 