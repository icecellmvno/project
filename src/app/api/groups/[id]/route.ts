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

    // Soft delete yap
    const group = await prisma.group.update({
      where: { id: params.id },
      data: { isActive: false }
    })

    return NextResponse.json(group)
  } catch (error) {
    console.error("Group delete error:", error)
    return NextResponse.json(
      { error: "Grup silinirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

export async function PATCH(
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

    const { name, description, color } = await req.json()

    // Grubu güncelle
    const group = await prisma.group.update({
      where: { id: params.id },
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
    console.error("Group update error:", error)
    return NextResponse.json(
      { error: "Grup güncellenirken bir hata oluştu" },
      { status: 500 }
    )
  }
} 