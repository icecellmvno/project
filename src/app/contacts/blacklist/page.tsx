import { AppHeader } from "@/components/app-header"
import { AppSidebar } from "@/components/app-sidebar"
import { prisma } from "@/lib/prisma"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { BlacklistActions } from "./actions"
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "gizli-anahtar"

async function getBlacklist() {
  // Token'dan tenant id'yi al
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value
  if (!token) throw new Error("Yetkilendirme gerekli")

  const decoded = verify(token, JWT_SECRET) as { tenantId: string }
  const tenantId = decoded.tenantId

  // Sadece o tenant'a ait kayıtları getir
  const blacklist = await prisma.blacklist.findMany({
    where: {
      tenantId,
      isActive: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return blacklist.map(item => ({
    ...item,
    createdAt: item.createdAt.toISOString()
  }))
}

export default async function BlacklistPage() {
  const blacklist = await getBlacklist()
  
  const breadcrumbs = [
    { title: "Rehber", href: "/contacts" },
    { title: "Kara Liste", isActive: true }
  ]

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-col h-full">
          <AppHeader breadcrumbs={breadcrumbs} />
          <div className="p-6">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">Kara Liste</h3>
                  <p className="text-sm text-muted-foreground">
                    İstenmeyen numaraları yönetin
                  </p>
                </div>
                <BlacklistActions />
              </div>
              <DataTable columns={columns} data={blacklist} searchKey="phone" />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
} 