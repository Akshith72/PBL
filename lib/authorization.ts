import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"

export async function getSession() {
  return auth.api.getSession({ headers: await headers() })
}

export async function requireUser() {
  const session = await getSession()
  if (!session?.user) redirect("/sign-in")
  return session.user
}

export async function isCampusAdmin(email: string) {
  const admins = (process.env.CAMPUS_ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
  return admins.includes(email.toLowerCase())
}

export async function requireCampusAdmin() {
  const user = await requireUser()
  if (!(await isCampusAdmin(user.email))) redirect("/")
  return user
}
