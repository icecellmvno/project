"use client"

import { useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { BlacklistDeleteDialog } from "@/components/contacts/blacklist-delete-dialog"

export type BlacklistItem = {
  id: string
  phone: string
  description: string | null
  createdAt: string
}

export const columns: ColumnDef<BlacklistItem>[] = [
  {
    accessorKey: "phone",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Telefon
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "description",
    header: "Açıklama",
  },
  {
    accessorKey: "createdAt",
    header: "Eklenme Tarihi",
    cell: ({ row }) => {
      return new Date(row.getValue("createdAt")).toLocaleDateString('tr-TR')
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const item = row.original
      const [deleteOpen, setDeleteOpen] = useState(false)
      const { toast } = useToast()

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
                  navigator.clipboard.writeText(item.phone)
                  toast({
                    description: "Telefon numarası kopyalandı",
                  })
                }}
              >
                Numarayı Kopyala
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Kara Listeden Çıkar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <BlacklistDeleteDialog
            id={item.id}
            phone={item.phone}
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            onSuccess={() => window.location.reload()}
          />
        </>
      )
    },
  },
] 