import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { verify } from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "gizli-anahtar"

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
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

    // Önce kaydın o tenant'a ait olduğunu kontrol et
    const blacklistItem = await prisma.blacklist.findUnique({
      where: { id: params.id }
    })

    if (!blacklistItem || blacklistItem.tenantId !== tenantId) {
      return NextResponse.json(
        { error: "Kayıt bulunamadı" },
        { status: 404 }
      )
    }

    // Soft delete yap
    const updatedItem = await prisma.blacklist.update({
      where: { id: params.id },
      data: { isActive: false }
    })

    return NextResponse.json(updatedItem)
  } catch (error) {
    console.error("Blacklist delete error:", error)
    return NextResponse.json(
      { error: "Kayıt silinirken bir hata oluştu" },
      { status: 500 }
    )
  }
} 