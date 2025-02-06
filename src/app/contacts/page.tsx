import { AppHeader } from "@/components/app-header"
import { AppSidebar } from "@/components/app-sidebar"
import { prisma } from "@/lib/prisma"
import { DataTable } from "./data-table"
import { columns } from "./columns"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"
import { ImportDialog } from "@/components/contacts/import-dialog"

const JWT_SECRET = process.env.JWT_SECRET || "gizli-anahtar"

async function getContacts() {
  // Token'dan tenant id'yi al
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value
  if (!token) throw new Error("Yetkilendirme gerekli")

  const decoded = verify(token, JWT_SECRET) as { tenantId: string }
  const tenantId = decoded.tenantId

  // Sadece o tenant'a ait kişileri getir
  const contacts = await prisma.contact.findMany({
    where: {
      tenantId,
      isActive: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return contacts.map(contact => ({
    ...contact,
    createdAt: contact.createdAt.toISOString()
  }))
}

export default async function ContactsPage() {
  const contacts = await getContacts()
  
  const breadcrumbs = [
    { title: "Rehber", isActive: true }
  ]

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-col h-full">
          <AppHeader breadcrumbs={breadcrumbs} />
          <div className="flex justify-end px-6 py-2 border-b">
            <ImportDialog />
            <Button asChild className="ml-2">
              <Link href="/contacts/new">
                Yeni Kişi
              </Link>
            </Button>
          </div>
          <div className="p-6">
            <DataTable columns={columns} data={contacts} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
} 