import { AppHeader } from "@/components/app-header"
import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

export default function BillingReportPage() {
  const breadcrumbs = [
    { title: "Raporlar", href: "/reports" },
    { title: "Fatura Raporu", isActive: true }
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
                <h3 className="text-lg font-medium">Fatura Raporu</h3>
                <p className="text-sm text-muted-foreground">
                  Fatura ve ödeme raporlarını görüntüleyin
                </p>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
} 