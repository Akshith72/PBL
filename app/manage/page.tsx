import type { Metadata } from "next"
import { desc } from "drizzle-orm"
import { db } from "@/lib/db"
import { contactMessages, menuItems } from "@/lib/db/schema"
import { requireCampusAdmin } from "@/lib/authorization"
import { getOrdersWithItems, saveMenuItem, toggleMenuAvailability, updateOrderStatus } from "@/app/actions"
import { formatRupees } from "@/lib/format"
import { PAYMENT_METHOD_LABELS } from "@/lib/payment-methods"
import { MenuDaySelect } from "@/components/menu-day-select"

export const metadata: Metadata = { title: "Campus management" }

const statusOptions = ["received", "preparing", "ready", "collected", "cancelled"]

export default async function ManagePage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  await requireCampusAdmin()
  const [query, items, ordersWithItems, messages] = await Promise.all([
    searchParams,
    db.select().from(menuItems).orderBy(desc(menuItems.createdAt)),
    getOrdersWithItems(),
    db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt)).limit(30),
  ])
  return <main className="main">
    <section className="container page-head"><span className="eyebrow"><span className="eyebrow-dot" />Campus team</span><h1>Kitchen dashboard</h1><p>Update what&apos;s on the counter, keep orders moving, and review student messages.</p></section>
    <section className="container page-content" style={{ display: "grid", gap: 22 }}>
      {query.saved && <p className="feedback success" role="status">Changes saved.</p>}
      {query.error && <p className="feedback" role="alert">We couldn&apos;t save that change. Please check the fields and try again.</p>}
      <div className="two-col">
        <div className="surface"><div className="section-heading"><div><span className="eyebrow"><span className="eyebrow-dot" />Menu</span><h2>Add a dish</h2></div></div>
          <form action={saveMenuItem} className="form-stack">
            <div className="field"><label htmlFor="new-dish">Dish name</label><input id="new-dish" name="name" minLength={2} maxLength={100} required /></div>
            <div className="field"><label htmlFor="new-description">Short description</label><input id="new-description" name="description" maxLength={240} /></div>
            <div className="field"><label htmlFor="new-category">Category</label><input id="new-category" name="category" defaultValue="Meals" maxLength={40} required /></div>
            <div className="field"><label htmlFor="new-price">Price (₹)</label><input id="new-price" name="price" type="number" min={1} max={100000} step={1} required /></div>
            <MenuDaySelect id="new-menu-day" />
            <button className="button">Add to menu</button>
          </form>
        </div>
        <div className="surface"><div className="section-heading"><div><span className="eyebrow"><span className="eyebrow-dot" />Availability</span><h2>Current dishes</h2></div></div>
          {items.length ? <div className="admin-grid">{items.map((item) => <article className="admin-item" key={item.id}>
            <form action={saveMenuItem} className="form-stack">
              <input type="hidden" name="id" value={item.id} />
              <div className="field"><label htmlFor={`name-${item.id}`}>Dish name</label><input id={`name-${item.id}`} name="name" defaultValue={item.name} required maxLength={100} /></div>
              <div className="field"><label htmlFor={`desc-${item.id}`}>Description</label><input id={`desc-${item.id}`} name="description" defaultValue={item.description} maxLength={240} /></div>
              <div className="field"><label htmlFor={`category-${item.id}`}>Category</label><input id={`category-${item.id}`} name="category" defaultValue={item.category} required maxLength={40} /></div>
              <div className="field"><label htmlFor={`price-${item.id}`}>Price (₹)</label><input id={`price-${item.id}`} name="price" type="number" min={1} max={100000} step={1} defaultValue={item.price} required /></div>
              <MenuDaySelect id={`menu-day-${item.id}`} defaultValue={item.menuDay} />
              <div className="admin-actions"><button className="button button-small">Save dish</button><span className="form-note">{item.available ? "Available" : "Hidden"} · {formatRupees(item.price)}</span></div>
            </form>
            <form action={toggleMenuAvailability}><input type="hidden" name="id" value={item.id} /><button className="button button-outline button-small">{item.available ? "Mark unavailable" : "Make available"}</button></form>
          </article>)}</div> : <p className="form-note">No menu items yet.</p>}
        </div>
      </div>

      <div className="surface"><div className="section-heading"><div><span className="eyebrow"><span className="eyebrow-dot" />Kitchen queue</span><h2>Recent orders</h2></div></div>
        {ordersWithItems.orders.length ? ordersWithItems.orders.map((order) => <div className="order-admin-row" key={order.id}>
          <div><strong>{order.code}</strong><div className="form-note">{order.pickupDay ? `Pickup ${order.pickupDay} · ` : ""}Payment: {PAYMENT_METHOD_LABELS[order.paymentMethod as keyof typeof PAYMENT_METHOD_LABELS] ?? "Cash"} · {ordersWithItems.items.filter((item) => item.orderId === order.id).map((item) => `${item.itemName} × ${item.quantity}`).join(", ")} · {formatRupees(order.total)}</div></div>
          <span className="status-pill">{order.status}</span>
          <form action={updateOrderStatus} className="admin-actions"><input type="hidden" name="id" value={order.id} /><label className="sr-only" htmlFor={`status-${order.id}`}>Status for {order.code}</label><select id={`status-${order.id}`} name="status" defaultValue={order.status}>{statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}</select><button className="button button-small">Update</button></form>
        </div>) : <p className="form-note">No orders yet.</p>}
      </div>

      <div className="surface"><div className="section-heading"><div><span className="eyebrow"><span className="eyebrow-dot" />Student support</span><h2>Recent messages</h2></div></div>
        {messages.length ? <div className="order-list">{messages.map((message) => <article className="admin-item" key={message.id}><div className="admin-item-title"><strong>{message.name}</strong><span className="form-note">{message.email}</span></div><p>{message.message}</p><span className="form-note">{new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(message.createdAt)}</span></article>)}</div> : <p className="form-note">No student messages yet.</p>}
      </div>
    </section>
  </main>
}
