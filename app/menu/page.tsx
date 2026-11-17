import type { Metadata } from "next"
import { eq } from "drizzle-orm"
import { OrderCart } from "@/components/order-cart"
import { db } from "@/lib/db"
import { menuItems } from "@/lib/db/schema"
import { getSession } from "@/lib/authorization"
import { getCurrentMenuDay } from "@/lib/menu-days"

export const metadata: Metadata = { title: "Weekday menu" }

export default async function MenuPage() {
  const [items, session] = await Promise.all([
    db.select().from(menuItems).where(eq(menuItems.available, true)).orderBy(menuItems.category, menuItems.name),
    getSession(),
  ])
  return (
    <main className="main">
      <section className="container page-head">
        <span className="eyebrow"><span className="eyebrow-dot" />Made fresh on campus</span>
        <h1>Weekday menu</h1>
        <p>Pick a day to see its rotating dishes. Everyday favorites stay on the menu all week.</p>
      </section>
      <section className="container page-content"><OrderCart items={items} signedIn={Boolean(session?.user)} defaultDay={getCurrentMenuDay()} /></section>
    </main>
  )
}
