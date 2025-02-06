"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export function TitleDialog() {
  const router = useRouter()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [type, setType] = useState<"ALPHANUMERIC" | "NUMERIC">("ALPHANUMERIC")

  const onSubmit = async () => {
    try {
      setLoading(true)
      
      const response = await fetch("/api/settings/titles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          type,
        }),
      })

      if (!response.ok) {
        throw new Error("Başlık eklenirken bir hata oluştu")
      }

      toast({
        title: "Başarılı",
        description: "Başlık başarıyla eklendi",
      })
      router.refresh()
      setOpen(false)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Başlık eklenirken bir hata oluştu",
      })
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Başlık
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Yeni SMS Başlığı</DialogTitle>
          <DialogDescription>
            SMS gönderimi için kullanılacak yeni bir başlık ekleyin. Başlık onay sürecine tabi olacaktır.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Başlık
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              disabled={loading}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Tip
            </Label>
            <Select 
              value={type} 
              onValueChange={(value: "ALPHANUMERIC" | "NUMERIC") => setType(value)}
              disabled={loading}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALPHANUMERIC">Alfanümerik</SelectItem>
                <SelectItem value="NUMERIC">Numerik</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={onSubmit} disabled={loading}>
            {loading ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 