"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Cookies from "js-cookie"
import { useAuth } from "@/contexts/auth-context"

export function LoginForm() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuth()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const username = formData.get("username") as string
    const password = formData.get("password") as string

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Giriş başarısız")
      }

      // Token'ı cookie'ye kaydet
      Cookies.set("token", data.token, { expires: 1 }) // 1 gün
      
      // User bilgisini localStorage'a kaydet
      localStorage.setItem("user", JSON.stringify(data.user))

      setAuth(data.user, data.user.tenant)

      // Dashboard'a yönlendir
      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Hesabınıza Giriş Yapın
        </h1>
        <p className="text-sm text-muted-foreground">
          Giriş yapmak için e-posta veya kullanıcı adınızı girin
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">E-posta veya Kullanıcı Adı</Label>
          <Input
            id="username"
            name="username"
            type="text"
            required
            placeholder="E-posta veya kullanıcı adınızı girin"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Şifre</Label>
            <a 
              href="/forgot-password" 
              className="text-sm text-primary hover:underline"
            >
              Şifremi Unuttum
            </a>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            required
            placeholder="Şifrenizi girin"
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
        </Button>
      </form>
    </div>
  )
}
