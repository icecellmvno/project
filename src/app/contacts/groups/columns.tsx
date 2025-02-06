"use client"

import { useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown, Pencil, Trash2, Users } from "lucide-react"
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
import { GroupEditDialog } from "@/components/contacts/group-edit-dialog"
import { GroupDeleteDialog } from "@/components/contacts/group-delete-dialog"

export type Group = {
  id: string
  name: string
  description: string | null
  color: string | null
  isActive: boolean
  createdAt: string
  _count?: {
    contacts: number
  }
}

async function deleteGroup(id: string) {
  try {
    const token = Cookies.get("token")
    const response = await fetch(`/api/groups/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
    if (!response.ok) {
      throw new Error("Grup silinirken bir hata oluştu")
    }
    return true
  } catch (error) {
    console.error("Grup silme hatası:", error)
    return false
  }
}

export const columns: ColumnDef<Group>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Grup Adı
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
    accessorKey: "color",
    header: "Renk",
    cell: ({ row }) => {
      const color = row.getValue("color") as string
      return (
        <div className="flex items-center gap-2">
          {color && (
            <div
              className="h-4 w-4 rounded-full border"
              style={{ backgroundColor: color }}
            />
          )}
          <span>{color || "-"}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "_count.contacts",
    header: "Kişi Sayısı",
    cell: ({ row }) => {
      const count = row.original._count?.contacts || 0
      return (
        <Badge variant="secondary" className="gap-1">
          <Users className="h-3 w-3" />
          {count}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const group = row.original
      const [editOpen, setEditOpen] = useState(false)
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
                  navigator.clipboard.writeText(group.id)
                  toast({
                    description: "ID kopyalandı",
                  })
                }}
              >
                ID Kopyala
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
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

          <GroupEditDialog 
            group={group} 
            open={editOpen} 
            onOpenChange={setEditOpen}
            onSuccess={() => window.location.reload()}
          />

          <GroupDeleteDialog
            groupId={group.id}
            groupName={group.name}
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            onSuccess={() => window.location.reload()}
          />
        </>
      )
    },
  },
] 