"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex h-screen flex-col items-center justify-center space-y-4">
      <div className="flex items-center space-x-2 text-red-600">
        <AlertCircle className="h-6 w-6" />
        <h2 className="text-lg font-semibold">Bir Hata Oluştu</h2>
      </div>
      <p className="text-muted-foreground">
        {error.message || "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin."}
      </p>
      <div className="flex space-x-2">
        <Button onClick={() => reset()}>Tekrar Dene</Button>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Sayfayı Yenile
        </Button>
      </div>
    </div>
  )
} 