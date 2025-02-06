import { GalleryVerticalEnd } from "lucide-react"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import { LoginForm } from "@/components/login-form"

async function getTenant() {
  const headersList = await headers();
  const domain = headersList.get("host")?.split(":")[0];
  
  if (!domain) return null
  
  return await prisma.tenant.findUnique({
    where: { domain },
    select: { name: true }
  })
}

export default async function LoginPage() {
  const tenant = await getTenant()

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>
            {tenant?.name || "Giriş"}
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="hidden bg-gradient-to-br from-muted to-muted/50 lg:block" />
    </div>
  )
}
