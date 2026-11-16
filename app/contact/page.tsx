import type { Metadata } from "next"
import { Mail, MessageCircle } from "lucide-react"
import { ContactForm } from "@/components/contact-form"

export const metadata: Metadata = { title: "Contact the campus team" }

export default function ContactPage() {
  return <main className="main">
    <section className="container page-head"><span className="eyebrow"><span className="eyebrow-dot" />We&apos;re here to help</span><h1>Say hello.</h1><p>Questions about the menu or a recent pickup? Send a note to the campus team and we&apos;ll get back to you.</p></section>
    <section className="container page-content two-col">
      <div className="surface"><ContactForm /></div>
      <aside className="feature-band" style={{ gridTemplateColumns: "1fr", alignContent: "start", marginBottom: 0 }}>
        <div className="feature"><span className="feature-icon"><MessageCircle size={18} /></span><div><h3>Real people, right here</h3><p>Your message goes straight to our campus team.</p></div></div>
        <div className="feature"><span className="feature-icon"><Mail size={18} /></span><div><h3>Track your pickup</h3><p>Sign in to find the latest update on your order.</p></div></div>
      </aside>
    </section>
  </main>
}
