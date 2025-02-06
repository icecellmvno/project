import { AppHeader } from "@/components/app-header"
import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

export default function ImportSmsPage() {
  const breadcrumbs = [
    { title: "SMS", href: "/sms" },
    { title: "Dosyadan Gönder", isActive: true }
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
                <h3 className="text-lg font-medium">Dosyadan SMS Gönder</h3>
                <p className="text-sm text-muted-foreground">
                  Excel veya CSV dosyasından SMS gönderimi yapın
                </p>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
} 