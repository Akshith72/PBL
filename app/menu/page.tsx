import type { Metadata } from "next"
import { eq } from "drizzle-orm"
import { OrderCart } from "@/components/order-cart"
import { db } from "@/lib/db"
import { menuItems } from "@/lib/db/schema"
import { getSession } from "@/lib/authorization"

export const metadata: Metadata = { title: "Today’s menu" }

export default async function MenuPage() {
  const [items, session] = await Promise.all([
    db.select().from(menuItems).where(eq(menuItems.available, true)).orderBy(menuItems.category, menuItems.name),
    getSession(),
  ])
  return (
    <main className="main">
      <section className="container page-head">
        <span className="eyebrow"><span className="eyebrow-dot" />Made fresh on campus</span>
        <h1>Today&apos;s menu</h1>
        <p>A little something for every kind of break. Add a few favorites to your bag and we&apos;ll have them ready for pickup.</p>
      </section>
      <section className="container page-content"><OrderCart items={items} signedIn={Boolean(session?.user)} /></section>
    </main>
  )
}
