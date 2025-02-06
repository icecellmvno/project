"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Upload, ArrowRight, Check } from "lucide-react"
import * as XLSX from "xlsx"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"

// Contact modelindeki alanlar
const CONTACT_FIELDS = {
  firstName: "Ad",
  lastName: "Soyad",
  email: "E-posta",
  phone: "Telefon",
  department: "Departman",
  title: "Ünvan",
  notes: "Notlar",
}

const fileSchema = z.object({
  file: z.instanceof(FileList).refine((files) => files.length === 1, "Bir dosya seçin"),
})

const mappingSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().optional(),
  phone: z.string(),
  department: z.string().optional(),
  title: z.string().optional(),
  notes: z.string().optional(),
})

type FileFormValues = z.infer<typeof fileSchema>
type MappingFormValues = z.infer<typeof mappingSchema>

export function ImportWizard() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [fileData, setFileData] = useState<any[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [progress, setProgress] = useState(0)
  const [importing, setImporting] = useState(false)

  const fileForm = useForm<FileFormValues>({
    resolver: zodResolver(fileSchema),
  })

  const mappingForm = useForm<MappingFormValues>({
    resolver: zodResolver(mappingSchema),
    defaultValues: {
      phone: "", // Telefon zorunlu
    },
  })

  async function onFileSubmit(data: FileFormValues) {
    const file = data.file[0]
    const reader = new FileReader()

    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer)
      const workbook = XLSX.read(data, { type: "array" })
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(firstSheet)
      const headers = Object.keys(jsonData[0])

      setFileData(jsonData)
      setHeaders(headers)
      setStep(2)
    }

    reader.readAsArrayBuffer(file)
  }

  async function onMappingSubmit(data: MappingFormValues) {
    setStep(3)
    setImporting(true)

    try {
      const mappedData = fileData.map(row => {
        const contact: any = {}
        
        Object.entries(data).forEach(([field, header]) => {
          if (header && row[header]) {
            contact[field] = row[header]
          }
        })

        return contact
      })

      // Her 100 kayıtta bir progress'i güncelle
      const batchSize = 100
      const totalBatches = Math.ceil(mappedData.length / batchSize)

      for (let i = 0; i < mappedData.length; i += batchSize) {
        const batch = mappedData.slice(i, i + batchSize)
        
        await fetch("/api/contacts/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contacts: batch }),
        })

        setProgress(((i + batchSize) / mappedData.length) * 100)
      }

      // İşlem tamamlandı
      setProgress(100)
    } catch (error) {
      console.error("Import error:", error)
    } finally {
      setImporting(false)
    }
  }

  if (step === 1) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dosya Seçimi</CardTitle>
          <CardDescription>
            Excel veya CSV dosyanızı seçin. İlk satır başlık olarak kullanılacaktır.
          </CardDescription>
        </CardHeader>
        <Form {...fileForm}>
          <form onSubmit={fileForm.handleSubmit(onFileSubmit)}>
            <CardContent>
              <FormField
                control={fileForm.control}
                name="file"
                render={({ field: { onChange, value, ...field } }) => (
                  <FormItem>
                    <FormLabel>Dosya</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={(e) => onChange(e.target.files)}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="submit">
                İleri
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    )
  }

  if (step === 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Alan Eşleştirme</CardTitle>
          <CardDescription>
            Dosyanızdaki alanları rehber alanlarıyla eşleştirin. Sadece telefon alanı zorunludur.
          </CardDescription>
        </CardHeader>
        <Form {...mappingForm}>
          <form onSubmit={mappingForm.handleSubmit(onMappingSubmit)}>
            <CardContent className="space-y-4">
              {Object.entries(CONTACT_FIELDS).map(([field, label]) => (
                <FormField
                  key={field}
                  control={mappingForm.control}
                  name={field as keyof MappingFormValues}
                  render={({ field: { value, onChange } }) => (
                    <FormItem>
                      <FormLabel>{label}</FormLabel>
                      <Select value={value} onValueChange={onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Alan seçin" />
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
              ))}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                Geri
              </Button>
              <Button type="submit">
                İçe Aktar
                <Upload className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>İçe Aktarma</CardTitle>
        <CardDescription>
          Kişileriniz içe aktarılıyor...
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={progress} />
        <div className="text-center">
          {importing ? (
            <p>İçe aktarma devam ediyor...</p>
          ) : (
            <div className="flex items-center justify-center gap-2 text-green-600">
              <Check className="h-4 w-4" />
              <p>İçe aktarma tamamlandı!</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={() => window.location.href = "/contacts"}>
          Rehbere Git
        </Button>
      </CardFooter>
    </Card>
  )
} 