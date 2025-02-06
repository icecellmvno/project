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

    // Sadece aktif kayıtları getir
    const blacklist = await prisma.blacklist.findMany({
      where: {
        tenantId,
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(blacklist)
  } catch (error) {
    console.error("Blacklist error:", error)
    return NextResponse.json(
      { error: "Kara liste getirilirken bir hata oluştu" },
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

    const { phone, description } = await req.json()

    const blacklistItem = await prisma.blacklist.create({
      data: {
        phone,
        description,
        tenantId
      }
    })

    return NextResponse.json(blacklistItem)
  } catch (error) {
    console.error("Blacklist create error:", error)
    return NextResponse.json(
      { error: "Kara listeye eklenirken bir hata oluştu" },
      { status: 500 }
    )
  }
} 