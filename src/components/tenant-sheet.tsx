"use client"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { TenantForm } from "./tenant-form"
import { Plus } from "lucide-react"

export function TenantSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4 bg-dark-500 text-primary-foreground" />
          Yeni Bayi
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-[425px]">
        <SheetHeader>
          <SheetTitle>Yeni Bayi Ekle</SheetTitle>
          <SheetDescription>
            Yeni bir bayi eklemek için aşağıdaki formu doldurun.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6">
          <TenantForm />
        </div>
      </SheetContent>
    </Sheet>
  )
} 