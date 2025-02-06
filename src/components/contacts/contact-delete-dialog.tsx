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

interface ContactDeleteDialogProps {
  contactId: string
  contactName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function ContactDeleteDialog({
  contactId,
  contactName,
  open,
  onOpenChange,
  onSuccess
}: ContactDeleteDialogProps) {
  const { toast } = useToast()
  
  const deleteContact = async () => {
    try {
      const token = Cookies.get("token")
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error("Kişi silinirken bir hata oluştu")
      }

      toast({
        title: "Başarılı",
        description: "Kişi başarıyla silindi",
      })
      onSuccess?.()
    } catch (error) {
      console.error("Kişi silme hatası:", error)
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Kişi silinirken bir hata oluştu",
      })
    } finally {
      onOpenChange(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Kişiyi Sil</AlertDialogTitle>
          <AlertDialogDescription>
            <p>
              <strong>{contactName}</strong> kişisini silmek istediğinize emin misiniz?
            </p>
            <p className="mt-2">
              Bu işlem geri alınamaz ve kişi tüm gruplardan çıkarılacaktır.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>İptal</AlertDialogCancel>
          <AlertDialogAction 
            onClick={deleteContact}
            className="bg-red-600 hover:bg-red-700"
          >
            Sil
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
} 