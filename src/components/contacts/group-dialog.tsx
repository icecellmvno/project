"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import Cookies from "js-cookie"
import { useToast } from "@/hooks/use-toast"

const groupSchema = z.object({
  name: z.string().min(2, "Grup adı en az 2 karakter olmalıdır"),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Geçerli bir renk kodu girin").optional(),
})

interface GroupDialogProps {
  onSuccess?: () => void
}

export function GroupDialog({ onSuccess }: GroupDialogProps) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  const form = useForm({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: "",
      description: "",
      color: "#000000",
    },
  })

  const onSubmit = async (data: z.infer<typeof groupSchema>) => {
    try {
      const token = Cookies.get("token")
      
      const response = await fetch("/api/groups", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Grup oluşturulurken bir hata oluştu")
      }

      toast({
        title: "Başarılı",
        description: "Grup başarıyla oluşturuldu",
      })
      setOpen(false)
      form.reset()
      onSuccess?.()
    } catch (error) {
      console.error("Grup oluşturma hatası:", error)
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Grup oluşturulurken bir hata oluştu",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Yeni Grup
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Yeni Grup Oluştur</DialogTitle>
          <DialogDescription>
            Kişileri organize etmek için yeni bir grup oluşturun
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grup Adı</FormLabel>
                  <FormControl>
                    <Input placeholder="Grup adını girin" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Açıklama</FormLabel>
                  <FormControl>
                    <Input placeholder="Grup açıklaması girin (opsiyonel)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Renk</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input type="color" {...field} />
                      <Input 
                        placeholder="#000000" 
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Oluştur
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 