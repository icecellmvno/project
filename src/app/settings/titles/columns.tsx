"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown } from "lucide-react"
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

export type SmsTitle = {
  id: string
  title: string
  type: "ALPHANUMERIC" | "NUMERIC"
  status: "PENDING" | "APPROVED" | "REJECTED"
  reason: string | null
  createdAt: string
  approvedAt: string | null
}

export const columns: ColumnDef<SmsTitle>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Başlık
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "type",
    header: "Tip",
    cell: ({ row }) => {
      const type = row.getValue("type") as string
      const label = {
        ALPHANUMERIC: "Alfanümerik",
        NUMERIC: "Numerik"
      }[type]
      return <Badge variant="outline">{label}</Badge>
    },
  },
  {
    accessorKey: "status",
    header: "Durum",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      const variant = {
        PENDING: "secondary",
        APPROVED: "default",
        REJECTED: "destructive"
      }[status] as "default" | "secondary" | "destructive"
      
      const label = {
        PENDING: "Bekliyor",
        APPROVED: "Onaylandı",
        REJECTED: "Reddedildi"
      }[status]

      return <Badge variant={variant}>{label}</Badge>
    },
  },
  {
    accessorKey: "reason",
    header: "Ret Sebebi",
    cell: ({ row }) => {
      const reason = row.getValue("reason") as string | null
      return reason || "-"
    },
  },
  {
    accessorKey: "createdAt",
    header: "Talep Tarihi",
    cell: ({ row }) => {
      return new Date(row.getValue("createdAt")).toLocaleDateString('tr-TR')
    },
  },
  {
    accessorKey: "approvedAt",
    header: "Onay Tarihi",
    cell: ({ row }) => {
      const date = row.getValue("approvedAt") as string | null
      return date ? new Date(date).toLocaleDateString('tr-TR') : "-"
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const title = row.original

      return (
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
              onClick={() => navigator.clipboard.writeText(title.id)}
            >
              ID Kopyala
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Düzenle</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">Sil</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
] 