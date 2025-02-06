import { Metadata } from "next"
import { GroupList } from "./group-list"
import { AppHeader } from "@/components/app-header"
import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

export const metadata: Metadata = {
  title: "Gruplar",
  description: "Kişi gruplarını yönetin",
}

export default function GroupsPage() {
  const breadcrumbs = [
    { title: "Rehber", href: "/contacts" },
    { title: "Gruplar", isActive: true }
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
                <h3 className="text-lg font-medium">Gruplar</h3>
                <p className="text-sm text-muted-foreground">
                  Kişilerinizi organize etmek için grupları yönetin
                </p>
              </div>
              <GroupList />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
} 