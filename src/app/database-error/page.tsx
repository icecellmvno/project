import { Button } from "@/components/ui/button"
import { DatabaseOff } from "lucide-react"

export default function DatabaseErrorPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center space-y-4">
      <div className="flex items-center space-x-2 text-red-600">
        <DatabaseOff className="h-8 w-8" />
        <h2 className="text-xl font-semibold">Veritabanı Hatası</h2>
      </div>
      <div className="max-w-md text-center space-y-2">
        <p className="text-muted-foreground">
          Veritabanına bağlanırken bir hata oluştu. Lütfen sistem yöneticinizle iletişime geçin.
        </p>
        <p className="text-sm text-muted-foreground">
          Hata kodu: DB_CONNECTION_ERROR
        </p>
      </div>
      <div className="flex space-x-2">
        <Button onClick={() => window.location.reload()}>
          Tekrar Dene
        </Button>
        <Button variant="outline" asChild>
          <a href="mailto:support@example.com">
            Destek Al
          </a>
        </Button>
      </div>
    </div>
  )
} 