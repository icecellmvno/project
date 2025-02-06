"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import * as XLSX from "xlsx"
import { Upload, FileSpreadsheet } from "lucide-react"
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
import { useEffect } from "react"
import { GroupDialog } from "./group-dialog"

const fileSchema = z.object({
  file: z.instanceof(File),
  groupId: z.string({ required_error: "Grup seçimi zorunludur" }),
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

type Group = {
  id: string
  name: string
}

export function ImportDialog() {
  const [step, setStep] = useState(1)
  const [fileData, setFileData] = useState<any[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [progress, setProgress] = useState(0)
  const [importing, setImporting] = useState(false)
  const [groups, setGroups] = useState<Group[]>([])
  const [open, setOpen] = useState(false)

  const fileForm = useForm({
    resolver: zodResolver(fileSchema),
  })

  const mappingForm = useForm({
    resolver: zodResolver(mappingSchema),
  })

  // Grupları yükle
  useEffect(() => {
    async function loadGroups() {
      const response = await fetch("/api/groups")
      const data = await response.json()
      setGroups(data)
    }
    if (open) {
      loadGroups()
    }
  }, [open])

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
    const groupId = fileForm.getValues("groupId")

    const mappedData = fileData.map((row) => ({
      firstName: row[data.firstName],
      lastName: row[data.lastName],
      email: row[data.email],
      phone: row[data.phone],
      department: row[data.department],
      title: row[data.title],
      notes: row[data.notes],
      groupId: groupId,
    }))

    const batchSize = 100
    const batches = []

    for (let i = 0; i < mappedData.length; i += batchSize) {
      batches.push(mappedData.slice(i, i + batchSize))
    }

    try {
      for (let i = 0; i < batches.length; i++) {
        await fetch("/api/contacts/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contacts: batches[i] }),
        })
        setProgress(((i + 1) / batches.length) * 100)
      }

      setStep(3)
    } catch (error) {
      console.error("İçe aktarma hatası:", error)
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
          <DialogTitle>Kişileri İçe Aktar</DialogTitle>
          <DialogDescription>
            Excel veya CSV dosyasından kişileri içe aktarın
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <Form {...fileForm}>
            <form onSubmit={fileForm.handleSubmit(onFileSubmit)} className="space-y-4">
              <FormField
                control={fileForm.control}
                name="file"
                render={({ field: { onChange, ref, ...field } }) => (
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

              <FormField
                control={fileForm.control}
                name="groupId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grup Seç</FormLabel>
                    <div className="flex gap-2">
                      <Select onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Grup seçin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {groups.map((group) => (
                            <SelectItem key={group.id} value={group.id}>
                              {group.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <GroupDialog />
                    </div>
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
              <div className="grid gap-4">
                <FormField
                  control={mappingForm.control}
                  name="phone"
                  render={({ field: { ref, ...field } }) => (
                    <FormItem>
                      <FormLabel>Telefon (Zorunlu)</FormLabel>
                      <Select onValueChange={field.onChange}>
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

                {["firstName", "lastName", "email", "department", "title", "notes"].map((fieldName) => (
                  <FormField
                    key={fieldName}
                    control={mappingForm.control}
                    name={fieldName as any}
                    render={({ field: { ref, ...field } }) => (
                      <FormItem>
                        <FormLabel>{fieldName}</FormLabel>
                        <Select onValueChange={field.onChange}>
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
                ))}
              </div>

              <Button type="submit" className="w-full" disabled={importing}>
                <Upload className="mr-2 h-4 w-4" />
                İçe Aktar
              </Button>

              {importing && (
                <div className="space-y-2">
                  <Progress value={progress} />
                  <p className="text-sm text-muted-foreground text-center">
                    Kişiler içe aktarılıyor... (%{Math.round(progress)})
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
                Tüm kişiler başarıyla içe aktarıldı.
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