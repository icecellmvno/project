import { AppHeader } from "@/components/app-header"
import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

export default function ReportsPage() {
  const breadcrumbs = [
    { title: "Raporlar", isActive: true }
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
                <h3 className="text-lg font-medium">Raporlar</h3>
                <p className="text-sm text-muted-foreground">
                  Tüm raporları görüntüleyin ve yönetin
                </p>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
} 