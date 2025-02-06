import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { writeFile } from "fs/promises"
import { join } from "path"
import { hash } from "bcryptjs"

export async function POST(req: Request) {
  try {
    const headersList = await headers()
    const token = headersList.get("Authorization")?.split(" ")[1]

    if (!token) {
      return NextResponse.json(
        { error: "Yetkilendirme gerekli" },
        { status: 401 }
      )
    }

    const formData = await req.formData()
    
    // Tenant verileri
    const name = formData.get("name") as string
    const domain = formData.get("domain") as string
    const title = formData.get("title") as string
    const type = formData.get("type") as string
    const credit = parseInt(formData.get("credit") as string)
    const logo = formData.get("logo") as File
    const favicon = formData.get("favicon") as File

    // User verileri
    const firstName = formData.get("firstName") as string
    const lastName = formData.get("lastName") as string
    const email = formData.get("email") as string
    const username = formData.get("username") as string
    const password = formData.get("password") as string

    let logoPath: string | null = null
    let faviconPath: string | null = null

    if (logo) {
      const bytes = await logo.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const fileName = `${Date.now()}-${logo.name}`
      const path = join(process.cwd(), "public", "uploads", fileName)
      await writeFile(path, buffer)
      logoPath = `/uploads/${fileName}`
    }

    if (favicon) {
      const bytes = await favicon.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const fileName = `${Date.now()}-${favicon.name}`
      const path = join(process.cwd(), "public", "uploads", fileName)
      await writeFile(path, buffer)
      faviconPath = `/uploads/${fileName}`
    }

    // Şifreyi hashle
    const hashedPassword = await hash(password, 10)

    // Tenant ve User'ı tek transaction'da oluştur
    const result = await prisma.$transaction(async (tx) => {
      // Önce tenant'ı oluştur
      const tenant = await tx.tenant.create({
        data: {
          name,
          domain,
          title,
          credit,
          tenantType: type.toUpperCase() as "RESELLER" | "CUSTOMER" | "HOST",
          logo: logoPath,
          favicon: faviconPath,
        },
      })

      // Sonra user'ı oluştur
      const user = await tx.user.create({
        data: {
          firstName,
          lastName,
          email,
          username,
          password: hashedPassword,
          tenantId: tenant.id,
        },
      })

      return { tenant, user }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Tenant ekleme hatası:", error)
    return NextResponse.json(
      { error: "Bayi eklenirken bir hata oluştu" },
      { status: 500 }
    )
  }
} 