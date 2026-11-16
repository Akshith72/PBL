import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { AuthForm } from "@/components/auth-form"
import { getSession } from "@/lib/authorization"

export const metadata: Metadata = { title: "Create account" }

export default async function SignUpPage() {
  if ((await getSession())?.user) redirect("/menu")
  return <main className="main"><AuthForm mode="sign-up" /></main>
}
