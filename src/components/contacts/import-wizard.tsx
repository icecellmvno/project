"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import * as XLSX from "xlsx"
import { Upload, FileSpreadsheet, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const fileSchema = z.object({
  file: z.instanceof(File),
})

const mappingSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  phone: z.string(),
  department: z.string().optional(),
  title: z.string().optional(),
  notes: z.string().optional(),
})

export function ImportWizard() {
  const [step, setStep] = useState(1)
  const [fileData, setFileData] = useState<any[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [progress, setProgress] = useState(0)
  const [importing, setImporting] = useState(false)

  const fileForm = useForm({
    resolver: zodResolver(fileSchema),
  })

  const mappingForm = useForm({
    resolver: zodResolver(mappingSchema),
  })

  const onFileSubmit = async (data: any) => {
    const file = data.file
    const reader = new FileReader()

    reader.onload = (e) => {
      const wb = XLSX.read(e.target?.result, { type: "binary" })
      const wsname = wb.SheetNames[0]
      const ws = wb.Sheets[wsname]
      const data = XLSX.utils.sheet_to_json(ws)
      const headers = Object.keys(data[0])

      setFileData(data)
      setHeaders(headers)
      setStep(2)
    }

    reader.readAsBinaryString(file)
  }

  const onMappingSubmit = async (data: any) => {
    setImporting(true)
    const mappedData = fileData.map((row) => ({
      firstName: row[data.firstName],
      lastName: row[data.lastName],
      email: row[data.email],
      phone: row[data.phone],
      department: row[data.department],
      title: row[data.title],
      notes: row[data.notes],
    }))

    const batchSize = 100
    const batches = []

    for (let i = 0; i < mappedData.length; i += batchSize) {
      batches.push(mappedData.slice(i, i + batchSize))
    }

    for (let i = 0; i < batches.length; i++) {
      await fetch("/api/contacts/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contacts: batches[i] }),
      })
      setProgress(((i + 1) / batches.length) * 100)
    }

    setImporting(false)
    setStep(3)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kişileri İçe Aktar</CardTitle>
        <CardDescription>
          Excel veya CSV dosyasından kişileri içe aktarın
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 1 && (
          <Form {...fileForm}>
            <form onSubmit={fileForm.handleSubmit(onFileSubmit)}>
              <FormField
                control={fileForm.control}
                name="file"
                render={({ field: { onChange }, ...field }) => (
                  <FormItem>
                    <FormLabel>Dosya Seç</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={(e) =>
                          onChange(e.target.files ? e.target.files[0] : null)
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="mt-4">
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Devam Et
              </Button>
            </form>
          </Form>
        )}

        {step === 2 && (
          <Form {...mappingForm}>
            <form onSubmit={mappingForm.handleSubmit(onMappingSubmit)}>
              <div className="grid gap-4">
                <FormField
                  control={mappingForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ad</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
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
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Soyad</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
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
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-posta</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
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
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefon</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
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
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Departman</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
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
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ünvan</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
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
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notlar</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
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
              </div>

              <Button type="submit" className="mt-4" disabled={importing}>
                <Upload className="mr-2 h-4 w-4" />
                İçe Aktar
              </Button>
            </form>
          </Form>
        )}

        {step === 3 && (
          <div className="text-center">
            <h3 className="text-lg font-medium">İçe Aktarma Tamamlandı!</h3>
            <p className="text-sm text-muted-foreground">
              Tüm kişiler başarıyla içe aktarıldı.
            </p>
          </div>
        )}

        {importing && (
          <div className="mt-4">
            <Progress value={progress} />
            <p className="text-sm text-muted-foreground mt-2">
              Kişiler içe aktarılıyor...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 