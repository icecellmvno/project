import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const titleSchema = z.object({
  title: z.string().min(1).max(11),
  type: z.enum(["ALPHANUMERIC", "NUMERIC"])
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const titles = await prisma.smsTitle.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json(titles)
  } catch (error) {
    console.error("[TITLES_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { title, type } = titleSchema.parse(body)

    const smsTitle = await prisma.smsTitle.create({
      data: {
        title,
        type,
        userId: session.user.id
      }
    })

    return NextResponse.json(smsTitle)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 422 })
    }

    console.error("[TITLES_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 