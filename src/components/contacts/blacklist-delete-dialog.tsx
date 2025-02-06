"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import Cookies from "js-cookie"

interface BlacklistDeleteDialogProps {
  id: string
  phone: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function BlacklistDeleteDialog({
  id,
  phone,
  open,
  onOpenChange,
  onSuccess
}: BlacklistDeleteDialogProps) {
  const { toast } = useToast()
  
  const deleteItem = async () => {
    try {
      const token = Cookies.get("token")
      const response = await fetch(`/api/blacklist/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error("Kayıt silinirken bir hata oluştu")
      }

      toast({
        title: "Başarılı",
        description: "Numara kara listeden çıkarıldı",
      })
      onSuccess?.()
    } catch (error) {
      console.error("Kara liste silme hatası:", error)
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Kayıt silinirken bir hata oluştu",
      })
    } finally {
      onOpenChange(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Kara Listeden Çıkar</AlertDialogTitle>
          <AlertDialogDescription>
            <p>
              <strong>{phone}</strong> numarasını kara listeden çıkarmak istediğinize emin misiniz?
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>İptal</AlertDialogCancel>
          <AlertDialogAction 
            onClick={deleteItem}
            className="bg-red-600 hover:bg-red-700"
          >
            Çıkar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
} 