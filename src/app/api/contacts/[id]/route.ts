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

    // Önce kişinin o tenant'a ait olduğunu kontrol et
    const contact = await prisma.contact.findUnique({
      where: { id: params.id }
    })

    if (!contact || contact.tenantId !== tenantId) {
      return NextResponse.json(
        { error: "Kişi bulunamadı" },
        { status: 404 }
      )
    }

    // Soft delete yap
    const updatedContact = await prisma.contact.update({
      where: { id: params.id },
      data: { isActive: false }
    })

    return NextResponse.json(updatedContact)
  } catch (error) {
    console.error("Contact delete error:", error)
    return NextResponse.json(
      { error: "Kişi silinirken bir hata oluştu" },
      { status: 500 }
    )
  }
} 