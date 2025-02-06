"use client"

import { BlacklistDialog } from "@/components/contacts/blacklist-dialog"
import { BlacklistImportDialog } from "@/components/contacts/blacklist-import-dialog"
import { useRouter } from "next/navigation"

export function BlacklistActions() {
  const router = useRouter()

  const handleSuccess = () => {
    router.refresh()
  }

  return (
    <div className="flex gap-2">
      <BlacklistImportDialog onSuccess={handleSuccess} />
      <BlacklistDialog onSuccess={handleSuccess} />
    </div>
  )
} 