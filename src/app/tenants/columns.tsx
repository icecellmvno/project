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

export type Tenant = {
  id: string
  name: string
  domain: string
  title: string
  credit: number
  createdAt: string
  tenantType: "RESELLER" | "CUSTOMER" | "HOST"
}

export const columns: ColumnDef<Tenant>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Bayi Adı
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "domain",
    header: "Domain",
  },
  {
    accessorKey: "title",
    header: "Başlık",
  },
  {
    accessorKey: "credit",
    header: "Kredi",
  },
  {
    accessorKey: "tenantType",
    header: "Tip",
    cell: ({ row }) => {
      const type = row.getValue("tenantType") as string
      const label = {
        RESELLER: "Bayi",
        CUSTOMER: "Müşteri",
        HOST: "Host"
      }[type]
      const variant = {
        RESELLER: "default",
        CUSTOMER: "secondary",
        HOST: "destructive"
      }[type] as "default" | "secondary" | "destructive"

      return <Badge variant={variant}>{label}</Badge>
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
      const tenant = row.original

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
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(tenant.id)}>
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