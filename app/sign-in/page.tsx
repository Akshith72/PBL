import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { AuthForm } from "@/components/auth-form"
import { getSession } from "@/lib/authorization"

export const metadata: Metadata = { title: "Sign in" }

export default async function SignInPage() {
  if ((await getSession())?.user) redirect("/menu")
  return <main className="main"><AuthForm mode="sign-in" /></main>
}
