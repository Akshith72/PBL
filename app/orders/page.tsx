import type { Metadata } from "next"
import Link from "next/link"
import { and, inArray, eq, desc } from "drizzle-orm"
import { db } from "@/lib/db"
import { campusOrderItems, campusOrders } from "@/lib/db/schema"
import { requireUser } from "@/lib/authorization"
import { formatRupees } from "@/lib/format"

export const metadata: Metadata = { title: "My orders" }

const statusLabels: Record<string, string> = { received: "Received", preparing: "In the kitchen", ready: "Ready for pickup", collected: "Collected", cancelled: "Cancelled" }

export default async function OrdersPage() {
  const user = await requireUser()
  const orders = await db.select().from(campusOrders).where(eq(campusOrders.userId, user.id)).orderBy(desc(campusOrders.createdAt))
  const items = orders.length ? await db.select().from(campusOrderItems).where(andOrderIds(orders.map((order) => order.id), user.id)) : []
  return <main className="main">
    <section className="container page-head"><span className="eyebrow"><span className="eyebrow-dot" />Your campus kitchen</span><h1>Your orders</h1><p>Every pickup, all in one place. We&apos;ll update your order here as the kitchen gets it ready.</p></section>
    <section className="container page-content">
      {orders.length ? <div className="order-list">{orders.map((order) => {
        const orderItems = items.filter((item) => item.orderId === order.id)
        return <article className="order-card" key={order.id}>
          <div className="order-header"><div><div className="order-code">{order.code}</div><div className="order-date">{new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(order.createdAt)}</div></div><span className={`status-pill ${order.status}`}>{statusLabels[order.status] ?? order.status}</span></div>
          <div className="order-details">{orderItems.map((item) => <div key={item.id}>{item.itemName} × {item.quantity} <span>· {formatRupees(item.unitPrice * item.quantity)}</span></div>)}</div>
          <div className="order-header" style={{ borderBottom: 0, paddingBottom: 0, marginTop: 12 }}><span className="form-note">Pickup at the campus counter</span><span className="order-total">{formatRupees(order.total)}</span></div>
        </article>
      })}</div> : <div className="surface empty-state"><h2>No orders yet</h2><p>Find something delicious and it&apos;ll show up here.</p><Link href="/menu" className="button" style={{ marginTop: 12 }}>Browse the menu</Link></div>}
    </section>
  </main>
}

function andOrderIds(ids: string[], userId: string) {
  return and(inArray(campusOrderItems.orderId, ids), eq(campusOrderItems.userId, userId))
}
