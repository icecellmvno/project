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
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Cookies from "js-cookie"
import { useToast } from "@/hooks/use-toast"

const blacklistSchema = z.object({
  phone: z.string().min(10, "Telefon numarası en az 10 karakter olmalıdır"),
  description: z.string().optional(),
})

interface BlacklistDialogProps {
  onSuccess?: () => void
}

export function BlacklistDialog({ onSuccess }: BlacklistDialogProps) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const form = useForm({
    resolver: zodResolver(blacklistSchema),
    defaultValues: {
      phone: "",
      description: "",
    },
  })

  const onSubmit = async (data: z.infer<typeof blacklistSchema>) => {
    try {
      setError(null)
      const token = Cookies.get("token")
      
      const response = await fetch("/api/blacklist", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || "Kara listeye eklenirken bir hata oluştu")
        return
      }

      toast({
        title: "Başarılı",
        description: "Numara kara listeye eklendi",
      })
      setOpen(false)
      form.reset()
      onSuccess?.()
    } catch (error) {
      console.error("Kara liste ekleme hatası:", error)
      setError("Kara listeye eklenirken bir hata oluştu")
    }
  }

  return (
    <Dialog open={open} onOpenChange={(open) => {
      setOpen(open)
      if (!open) setError(null)
    }}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Numara
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Kara Listeye Ekle</DialogTitle>
          <DialogDescription>
            Kara listeye yeni bir telefon numarası ekleyin
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefon Numarası</FormLabel>
                  <FormControl>
                    <Input placeholder="Telefon numarasını girin" {...field} />
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
                    <Textarea 
                      placeholder="Açıklama girin (opsiyonel)" 
                      className="resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Ekle
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 