import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { verify } from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "gizli-anahtar"

export async function GET(req: Request) {
  try {
    // Token'dan tenant id'yi al
    const headersList = headers()
    const token = headersList.get("Authorization")?.split(" ")[1]
    
    if (!token) {
      return NextResponse.json(
        { error: "Yetkilendirme gerekli" },
        { status: 401 }
      )
    }

    const decoded = verify(token, JWT_SECRET) as { tenantId: string }
    const tenantId = decoded.tenantId

    // Sadece aktif grupları getir
    const groups = await prisma.group.findMany({
      where: {
        isActive: true
      },
      include: {
        _count: {
          select: {
            contacts: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(groups)
  } catch (error) {
    console.error("Groups error:", error)
    return NextResponse.json(
      { error: "Gruplar getirilirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    // Token'dan tenant id'yi al
    const headersList = headers()
    const token = headersList.get("Authorization")?.split(" ")[1]
    
    if (!token) {
      return NextResponse.json(
        { error: "Yetkilendirme gerekli" },
        { status: 401 }
      )
    }

    const decoded = verify(token, JWT_SECRET) as { tenantId: string }
    const tenantId = decoded.tenantId

    const { name, description, color } = await req.json()

    const group = await prisma.group.create({
      data: {
        name,
        description,
        color,
      },
      include: {
        _count: {
          select: {
            contacts: true
          }
        }
      }
    })

    return NextResponse.json(group)
  } catch (error) {
    console.error("Group create error:", error)
    return NextResponse.json(
      { error: "Grup oluşturulurken bir hata oluştu" },
      { status: 500 }
    )
  }
} 