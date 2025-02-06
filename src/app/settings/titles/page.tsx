import { AppHeader } from "@/components/app-header"
import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { DataTable } from "./data-table"
import { columns } from "./columns"
import { TitleDialog } from "./title-dialog"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"
import { Toaster } from "@/components/ui/toaster"
import { redirect } from "next/navigation"

const JWT_SECRET = process.env.JWT_SECRET || "secret"

export default async function TitlesPage() {
  try {
    // Veritabanı bağlantısını kontrol et
    await prisma.$connect()

    const cookieStore = cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
      redirect("/login")
    }

    const decoded = verify(token, JWT_SECRET) as { userId: string, tenantId: string }

    const titles = await prisma.smsTitle.findMany({
      where: {
        userId: decoded.userId,
        user: {
          tenantId: decoded.tenantId
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    const breadcrumbs = [
      { title: "Yönetim", href: "/admin" },
      { title: "SMS Başlıkları", isActive: true }
    ]

    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-col h-full">
            <AppHeader breadcrumbs={breadcrumbs} />
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">SMS Başlıkları</h3>
                  <p className="text-sm text-muted-foreground">
                    SMS gönderimlerinde kullanılacak başlıkları yönetin
                  </p>
                </div>
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-3xl font-bold tracking-tight">SMS Başlıkları</h2>
                    <p className="text-muted-foreground">
                      SMS gönderimi için kullanılacak başlıkları yönetin
                    </p>
                  </div>
                  <TitleDialog />
                </div>
                <DataTable columns={columns} data={titles} />
              </div>
            </div>
          </div>
        </SidebarInset>
        <Toaster />
      </SidebarProvider>
    )
  } catch (error) {
    console.error("Database connection error:", error)
    redirect("/database-error")
  }
} 