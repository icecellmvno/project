import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { verify } from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "gizli-anahtar"

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

    const { items } = await req.json()

    // Toplu ekleme işlemi
    const result = await prisma.$transaction(
      items.map((item: any) =>
        prisma.blacklist.create({
          data: {
            phone: item.phone,
            description: item.description,
            tenantId,
          },
        })
      )
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error("Blacklist import error:", error)
    return NextResponse.json(
      { error: "Numaralar içe aktarılırken bir hata oluştu" },
      { status: 500 }
    )
  }
} 