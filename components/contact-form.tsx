"use client"

import { useActionState } from "react"
import { sendContactMessage, type ContactState } from "@/app/actions"

const initialState: ContactState = { message: "", success: false }

export function ContactForm() {
  const [state, action, pending] = useActionState(sendContactMessage, initialState)
  return <form action={action} className="form-stack">
    <div className="field"><label htmlFor="contact-name">Your name</label><input id="contact-name" name="name" autoComplete="name" minLength={2} maxLength={100} required /></div>
    <div className="field"><label htmlFor="contact-email">College email</label><input id="contact-email" name="email" type="email" autoComplete="email" maxLength={254} required /></div>
    <div className="field"><label htmlFor="contact-message">How can we help?</label><textarea id="contact-message" name="message" minLength={10} maxLength={2000} required /></div>
    {state.message && <p className={`feedback ${state.success ? "success" : ""}`} role="status">{state.message}</p>}
    <button className="button button-full" disabled={pending}>{pending ? "Sending…" : "Send message"}</button>
  </form>
}
