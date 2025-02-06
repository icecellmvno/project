"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useAuth } from "@/contexts/auth-context"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const MAX_FILE_SIZE = 5000000 // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp","image/svg","image/x-icon"]

const tenantFormSchema = z.object({
  name: z.string().min(2, "Bayi adı en az 2 karakter olmalıdır"),
  domain: z.string().min(3, "Domain en az 3 karakter olmalıdır"),
  title: z.string().min(2, "Başlık en az 2 karakter olmalıdır"),
  type: z.enum(["customer", "reseller"]),
  credit: z.coerce.number().min(0, "Kredi 0'dan küçük olamaz"),
  logo: z.instanceof(FileList)
    .refine((files) => files?.length === 0 || files?.length === 1, "Bir logo seçin")
    .refine(
      (files) => files?.length === 0 || files?.[0]?.size <= MAX_FILE_SIZE,
      "Maksimum dosya boyutu 5MB"
    )
    .refine(
      (files) =>
        files?.length === 0 || ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      "Sadece .jpg, .jpeg, .png ve .webp formatları desteklenir"
    )
    .optional(),
  favicon: z.instanceof(FileList)
    .refine((files) => files?.length === 0 || files?.length === 1, "Bir favicon seçin")
    .refine(
      (files) => files?.length === 0 || files?.[0]?.size <= MAX_FILE_SIZE,
      "Maksimum dosya boyutu 5MB"
    )
    .refine(
      (files) =>
        files?.length === 0 || ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      "Sadece .jpg, .jpeg, .png ve .webp formatları desteklenir"
    )
    .optional(),
})

const userFormSchema = z.object({
  firstName: z.string().min(2, "Ad en az 2 karakter olmalıdır"),
  lastName: z.string().min(2, "Soyad en az 2 karakter olmalıdır"),
  email: z.string().email("Geçerli bir e-posta adresi girin"),
  username: z.string().min(3, "Kullanıcı adı en az 3 karakter olmalıdır"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
})

type TenantFormValues = z.infer<typeof tenantFormSchema>
type UserFormValues = z.infer<typeof userFormSchema>

export function TenantForm() {
  const { user } = useAuth()
  const [step, setStep] = useState<1 | 2>(1)
  const [tenantData, setTenantData] = useState<TenantFormValues | null>(null)

  const tenantForm = useForm<TenantFormValues>({
    resolver: zodResolver(tenantFormSchema),
    defaultValues: {
      name: "",
      domain: "",
      title: "",
      type: "customer",
      credit: 0,
    },
  })

  const userForm = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      username: "",
      password: "",
    },
  })

  async function onTenantSubmit(data: TenantFormValues) {
    setTenantData(data)
    setStep(2)
  }

  async function onUserSubmit(data: UserFormValues) {
    try {
      const formData = new FormData()
      
      // Tenant verileri
      formData.append("name", tenantData!.name)
      formData.append("domain", tenantData!.domain)
      formData.append("title", tenantData!.title)
      formData.append("type", tenantData!.type)
      formData.append("credit", String(tenantData!.credit))
      
      if (tenantData!.logo?.[0]) {
        formData.append("logo", tenantData!.logo[0])
      }
      
      if (tenantData!.favicon?.[0]) {
        formData.append("favicon", tenantData!.favicon[0])
      }

      // User verileri
      formData.append("firstName", data.firstName)
      formData.append("lastName", data.lastName)
      formData.append("email", data.email)
      formData.append("username", data.username)
      formData.append("password", data.password)

      const response = await fetch("/api/tenants", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Bayi eklenirken bir hata oluştu")
      }

      tenantForm.reset()
      userForm.reset()
      setStep(1)
      setTenantData(null)
    } catch (error) {
      console.error("Bayi ekleme hatası:", error)
    }
  }

  const allowedTypes = user?.type === "host" 
    ? ["reseller", "customer"] 
    : ["customer"]

  if (step === 1) {
    return (
      <Form {...tenantForm}>
        <form onSubmit={tenantForm.handleSubmit(onTenantSubmit)} className="space-y-4">
          <FormField
            control={tenantForm.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bayi Adı</FormLabel>
                <FormControl>
                  <Input placeholder="Bayi adını girin" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={tenantForm.control}
            name="domain"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Domain</FormLabel>
                <FormControl>
                  <Input placeholder="Domain adresini girin" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={tenantForm.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Başlık</FormLabel>
                <FormControl>
                  <Input placeholder="Başlık girin" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={tenantForm.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bayi Tipi</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Bayi tipi seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {allowedTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type === "reseller" ? "Bayi" : "Müşteri"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={tenantForm.control}
            name="credit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kredi</FormLabel>
                <FormControl>
                  <Input type="number" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={tenantForm.control}
            name="logo"
            render={({ field: { onChange, value, ...field } }) => (
              <FormItem>
                <FormLabel>Logo</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-4">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => onChange(e.target.files)}
                      {...field}
                    />
                    {value?.[0] && (
                      <img
                        src={URL.createObjectURL(value[0])}
                        alt="Logo önizleme"
                        className="h-10 w-10 object-cover rounded-md"
                      />
                    )}
                  </div>
                </FormControl>
                <FormDescription>
                  Maksimum 5MB, .jpg, .jpeg, .png veya .webp
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={tenantForm.control}
            name="favicon"
            render={({ field: { onChange, value, ...field } }) => (
              <FormItem>
                <FormLabel>Favicon</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-4">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => onChange(e.target.files)}
                      {...field}
                    />
                    {value?.[0] && (
                      <img
                        src={URL.createObjectURL(value[0])}
                        alt="Favicon önizleme"
                        className="h-8 w-8 object-cover rounded-md"
                      />
                    )}
                  </div>
                </FormControl>
                <FormDescription>
                  Maksimum 5MB, .jpg, .jpeg, .png veya .webp
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button type="submit">İleri</Button>
          </div>
        </form>
      </Form>
    )
  }

  return (
    <Form {...userForm}>
      <form onSubmit={userForm.handleSubmit(onUserSubmit)} className="space-y-4">
        <FormField
          control={userForm.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ad</FormLabel>
              <FormControl>
                <Input placeholder="Adınızı girin" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={userForm.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Soyad</FormLabel>
              <FormControl>
                <Input placeholder="Soyadınızı girin" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={userForm.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-posta</FormLabel>
              <FormControl>
                <Input type="email" placeholder="E-posta adresinizi girin" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={userForm.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kullanıcı Adı</FormLabel>
              <FormControl>
                <Input placeholder="Kullanıcı adınızı girin" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={userForm.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Şifre</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Şifrenizi girin" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => setStep(1)}>
            Geri
          </Button>
          <Button type="submit">Kaydet</Button>
        </div>
      </form>
    </Form>
  )
} 