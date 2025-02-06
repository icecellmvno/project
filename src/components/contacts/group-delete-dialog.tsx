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

interface GroupDeleteDialogProps {
  groupId: string
  groupName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function GroupDeleteDialog({
  groupId,
  groupName,
  open,
  onOpenChange,
  onSuccess
}: GroupDeleteDialogProps) {
  const { toast } = useToast()
  
  const deleteGroup = async () => {
    try {
      const token = Cookies.get("token")
      const response = await fetch(`/api/groups/${groupId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error("Grup silinirken bir hata oluştu")
      }

      toast({
        title: "Başarılı",
        description: "Grup başarıyla silindi",
      })
      onSuccess?.()
    } catch (error) {
      console.error("Grup silme hatası:", error)
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Grup silinirken bir hata oluştu",
      })
    } finally {
      onOpenChange(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Grubu Sil</AlertDialogTitle>
          <AlertDialogDescription>
            <p>
              <strong>{groupName}</strong> grubunu silmek istediğinize emin misiniz?
            </p>
            <p className="mt-2">
              Bu işlem geri alınamaz ve gruptaki kişiler gruptan çıkarılacaktır.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>İptal</AlertDialogCancel>
          <AlertDialogAction 
            onClick={deleteGroup}
            className="bg-red-600 hover:bg-red-700"
          >
            Sil
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
} 