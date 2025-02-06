"use client"

import { useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { ContactDeleteDialog } from "@/components/contacts/contact-delete-dialog"

export type Contact = {
  id: string
  firstName: string | null
  lastName: string | null
  email: string | null
  phone: string
  department: string | null
  title: string | null
  notes: string | null
  isActive: boolean
  createdAt: string
}

export const columns: ColumnDef<Contact>[] = [
  {
    accessorKey: "firstName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Ad
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "lastName",
    header: "Soyad",
  },
  {
    accessorKey: "email",
    header: "E-posta",
  },
  {
    accessorKey: "phone",
    header: "Telefon",
  },
  {
    accessorKey: "department",
    header: "Departman",
  },
  {
    accessorKey: "title",
    header: "Ünvan",
  },
  {
    accessorKey: "isActive",
    header: "Durum",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean
      return (
        <Badge variant={isActive ? "default" : "secondary"}>
          {isActive ? "Aktif" : "Pasif"}
        </Badge>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: "Oluşturulma Tarihi",
    cell: ({ row }) => {
      return new Date(row.getValue("createdAt")).toLocaleDateString('tr-TR')
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const contact = row.original
      const [deleteOpen, setDeleteOpen] = useState(false)
      const { toast } = useToast()

      const contactName = [contact.firstName, contact.lastName]
        .filter(Boolean)
        .join(" ") || "İsimsiz Kişi"

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Menü aç</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
              <DropdownMenuItem 
                onClick={() => {
                  navigator.clipboard.writeText(contact.id)
                  toast({
                    description: "ID kopyalandı",
                  })
                }}
              >
                ID Kopyala
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Pencil className="mr-2 h-4 w-4" />
                Düzenle
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-red-600"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Sil
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ContactDeleteDialog
            contactId={contact.id}
            contactName={contactName}
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            onSuccess={() => window.location.reload()}
          />
        </>
      )
    },
  },
] 