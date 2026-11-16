"use client"

import { signOut } from "@/lib/auth-client"
import { useRouter } from "next/navigation"

export function AccountActions({ signedIn, name, admin }: { signedIn: boolean; name?: string; admin: boolean }) {
  const router = useRouter()
  if (!signedIn) return <a href="/sign-in" className="button button-small">Sign in</a>
  return <div className="nav-actions">
    {admin && <a href="/manage" className="button button-outline button-small">Manage</a>}
    <span className="form-note" style={{ maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
    <button type="button" className="button button-small button-dark" onClick={async () => { await signOut(); router.refresh() }}>Sign out</button>
  </div>
}
