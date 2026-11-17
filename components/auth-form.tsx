"use client"

import { FormEvent, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const [message, setMessage] = useState("")
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const isSignUp = mode === "sign-up"

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    setMessage("")
    startTransition(async () => {
      const result = isSignUp
        ? await authClient.signUp.email({ name: String(formData.get("name")), email: String(formData.get("email")), password: String(formData.get("password")) })
        : await authClient.signIn.email({ email: String(formData.get("email")), password: String(formData.get("password")) })
      if (result.error) {
        setMessage("We could not sign you in with those details. Please check and try again.")
        return
      }
      router.push("/menu")
      router.refresh()
    })
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <span className="eyebrow"><span className="eyebrow-dot" />CampusEats account</span>
        <h1>{isSignUp ? "Join the table." : "Welcome back."}</h1>
        <p>{isSignUp ? "Create your account to order ahead and follow every pickup." : "Sign in to place an order and see your recent pickups."}</p>
        <form className="form-stack" onSubmit={submit}>
          {isSignUp && <div className="field"><label htmlFor="name">Your name</label><input id="name" name="name" autoComplete="name" minLength={2} maxLength={100} required /></div>}
          <div className="field"><label htmlFor="email">College email</label><input id="email" name="email" type="email" autoComplete="email" maxLength={254} required /></div>
          <div className="field"><label htmlFor="password">Password</label><input id="password" name="password" type="password" autoComplete={isSignUp ? "new-password" : "current-password"} minLength={8} required /></div>
          {message && <p className="feedback" role="alert">{message}</p>}
          <button className="button button-full" disabled={isPending}>{isPending ? "Please wait…" : isSignUp ? "Create account" : "Sign in"}</button>
        </form>
        <p className="auth-switch">{isSignUp ? "Already have an account? " : "New to CampusEats? "}<Link href={isSignUp ? "/sign-in" : "/sign-up"}>{isSignUp ? "Sign in" : "Create an account"}</Link></p>
      </div>
    </div>
  )
}
