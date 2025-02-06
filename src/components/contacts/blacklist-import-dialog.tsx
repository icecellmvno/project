"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Upload, FileSpreadsheet } from "lucide-react"
import * as XLSX from "xlsx"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Cookies from "js-cookie"

const fileSchema = z.object({
  file: z.instanceof(FileList).refine((files) => files.length === 1, "Bir dosya seçin"),
})

const mappingSchema = z.object({
  phone: z.string(),
  description: z.string().optional(),
})

interface BlacklistImportDialogProps {
  onSuccess?: () => void
}

export function BlacklistImportDialog({ onSuccess }: BlacklistImportDialogProps) {
  const [step, setStep] = useState(1)
  const [fileData, setFileData] = useState<any[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [progress, setProgress] = useState(0)
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  const fileForm = useForm({
    resolver: zodResolver(fileSchema),
    defaultValues: {
      file: undefined,
    }
  })

  const mappingForm = useForm({
    resolver: zodResolver(mappingSchema),
    defaultValues: {
      phone: "",
      description: "",
    }
  })

  const onFileSubmit = async (data: any) => {
    try {
      setError(null)
      const file = data.file[0]
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const wb = XLSX.read(e.target?.result, { type: "binary" })
          
          if (!wb.SheetNames.length) {
            setError("Dosya boş veya okunamıyor")
            return
          }

          const wsname = wb.SheetNames[0]
          const ws = wb.Sheets[wsname]
          const jsonData = XLSX.utils.sheet_to_json(ws)

          if (!jsonData || !jsonData.length) {
            setError("Dosyada veri bulunamadı")
            return
          }

          const firstRow = jsonData[0]
          if (!firstRow || typeof firstRow !== 'object') {
            setError("Dosya formatı uygun değil")
            return
          }

          const headers = Object.keys(firstRow)
          if (!headers.length) {
            setError("Dosyada sütun başlıkları bulunamadı")
            return
          }

          setFileData(jsonData)
          setHeaders(headers)
          setStep(2)
        } catch (error) {
          console.error("Dosya okuma hatası:", error)
          setError("Dosya formatı uygun değil veya dosya bozuk")
        }
      }

      reader.onerror = () => {
        setError("Dosya okuma sırasında bir hata oluştu")
      }

      reader.readAsBinaryString(file)
    } catch (error) {
      console.error("Dosya okuma hatası:", error)
      setError("Dosya okunurken bir hata oluştu")
    }
  }

  const onMappingSubmit = async (data: any) => {
    try {
      setError(null)
      setImporting(true)

      const mappedData = fileData.map((row) => ({
        phone: row[data.phone],
        description: data.description ? row[data.description] : undefined,
      }))

      const batchSize = 100
      const batches = []

      for (let i = 0; i < mappedData.length; i += batchSize) {
        batches.push(mappedData.slice(i, i + batchSize))
      }

      const token = Cookies.get("token")

      for (let i = 0; i < batches.length; i++) {
        await fetch("/api/blacklist/import", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ items: batches[i] }),
        })
        setProgress(((i + 1) / batches.length) * 100)
      }

      setStep(3)
      onSuccess?.()
    } catch (error) {
      console.error("İçe aktarma hatası:", error)
      setError("İçe aktarma sırasında bir hata oluştu")
    } finally {
      setImporting(false)
    }
  }

  const resetDialog = () => {
    setStep(1)
    setFileData([])
    setHeaders([])
    setProgress(0)
    setImporting(false)
    setError(null)
    fileForm.reset()
    mappingForm.reset()
  }

  return (
    <Dialog open={open} onOpenChange={(open) => {
      setOpen(open)
      if (!open) resetDialog()
    }}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          İçe Aktar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Kara Listeye İçe Aktar</DialogTitle>
          <DialogDescription>
            Excel veya CSV dosyasından numaraları içe aktarın
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {step === 1 && (
          <Form {...fileForm}>
            <form onSubmit={fileForm.handleSubmit(onFileSubmit)} className="space-y-4">
              <FormField
                control={fileForm.control}
                name="file"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Dosya Seç</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={(e) => {
                          const files = e.target.files
                          if (files?.length) {
                            onChange(files)
                          }
                        }}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Devam Et
              </Button>
            </form>
          </Form>
        )}

        {step === 2 && (
          <Form {...mappingForm}>
            <form onSubmit={mappingForm.handleSubmit(onMappingSubmit)} className="space-y-4">
              <FormField
                control={mappingForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefon (Zorunlu)</FormLabel>
                    <Select 
                      value={field.value} 
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sütun seç" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {headers.map((header) => (
                          <SelectItem key={header} value={header}>
                            {header}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={mappingForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Açıklama</FormLabel>
                    <Select 
                      value={field.value || ""} 
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sütun seç (opsiyonel)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Seçilmedi</SelectItem>
                        {headers.map((header) => (
                          <SelectItem key={header} value={header}>
                            {header}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={importing}>
                <Upload className="mr-2 h-4 w-4" />
                İçe Aktar
              </Button>

              {importing && (
                <div className="space-y-2">
                  <Progress value={progress} />
                  <p className="text-sm text-muted-foreground text-center">
                    Numaralar içe aktarılıyor... (%{Math.round(progress)})
                  </p>
                </div>
              )}
            </form>
          </Form>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-medium text-green-600">İçe Aktarma Tamamlandı!</h3>
              <p className="text-sm text-muted-foreground">
                Tüm numaralar başarıyla kara listeye eklendi.
              </p>
            </div>
            <Button 
              className="w-full" 
              onClick={() => {
                setOpen(false)
                resetDialog()
              }}
            >
              Kapat
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 