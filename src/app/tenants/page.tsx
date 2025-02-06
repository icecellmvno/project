import { AppHeader } from "@/components/app-header"
import { AppSidebar } from "@/components/app-sidebar"
import { prisma } from "@/lib/prisma"
import { DataTable } from "./data-table"
import { columns } from "./columns"
import { TenantSheet } from "@/components/tenant-sheet"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

async function getTenants() {
  const tenants = await prisma.tenant.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  })

  return tenants.map(tenant => ({
    ...tenant,
    status: tenant.tenantType === 'HOST' ? 'active' : 'inactive',
    createdAt: tenant.createdAt.toISOString()
  }))
}

export default async function TenantsPage() {
  const tenants = await getTenants()
  
  const breadcrumbs = [
    { title: "Yönetim", href: "/admin" },
    { title: "Bayiler", isActive: true }
  ]

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-col h-full">
          <AppHeader breadcrumbs={breadcrumbs} />
          <div className="flex justify-end px-6 py-2 border-b">
            <TenantSheet />
          </div>
          <div className="p-6">
            <DataTable columns={columns} data={tenants} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
} 