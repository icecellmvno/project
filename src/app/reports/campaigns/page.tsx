import { AppHeader } from "@/components/app-header"
import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

export default function CampaignLogsPage() {
  const breadcrumbs = [
    { title: "Raporlar", href: "/reports" },
    { title: "Kampanya Logları", isActive: true }
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
                <h3 className="text-lg font-medium">Kampanya Logları</h3>
                <p className="text-sm text-muted-foreground">
                  Toplu SMS gönderimlerinin ve kampanyaların durumlarını takip edin
                </p>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
} 