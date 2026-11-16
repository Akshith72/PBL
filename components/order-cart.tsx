"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { Coffee, Sandwich, Soup, Utensils } from "lucide-react"
import { createOrder } from "@/app/actions"
import { formatRupees } from "@/lib/format"
import type { menuItems } from "@/lib/db/schema"

type MenuItem = typeof menuItems.$inferSelect
const dishIcons = [Soup, Sandwich, Utensils, Coffee]

export function OrderCart({ items, signedIn }: { items: MenuItem[]; signedIn: boolean }) {
  const [quantities, setQuantities] = useState<Record<number, number>>({})
  const [message, setMessage] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [isPending, startTransition] = useTransition()
  const count = Object.values(quantities).reduce((sum, quantity) => sum + quantity, 0)
  const total = items.reduce((sum, item) => sum + item.price * (quantities[item.id] ?? 0), 0)

  function changeQuantity(id: number, delta: number) {
    setQuantities((current) => {
      const next = Math.max(0, Math.min(20, (current[id] ?? 0) + delta))
      return { ...current, [id]: next }
    })
    setMessage("")
    setSubmitted(false)
  }

  function placeOrder() {
    setMessage("")
    startTransition(async () => {
      const result = await createOrder(Object.entries(quantities).filter(([, quantity]) => quantity > 0).map(([id, quantity]) => ({ id: Number(id), quantity })))
      setMessage(result.message)
      setSubmitted(result.success)
      if (result.success) setQuantities({})
    })
  }

  if (items.length === 0) return <div className="surface empty-state"><h2>Nothing on the counter just yet</h2><p>The kitchen hasn&apos;t added today&apos;s menu. Please check back soon.</p></div>

  return <>
    <div className="menu-toolbar"><div className="filter-pills"><span className="filter-pill active">Everything fresh</span><span className="filter-pill">Available now</span></div><span className="form-note">Prices in Indian rupees</span></div>
    <div className="menu-list">{items.map((item, index) => {
      const Icon = dishIcons[index % dishIcons.length]
      const quantity = quantities[item.id] ?? 0
      return <article className="menu-row" key={item.id}>
        <span className="dish-icon" aria-hidden="true"><Icon size={21} /></span>
        <div><h3>{item.name}</h3><p>{item.description || `${item.category} · Freshly prepared in our campus kitchen`}</p></div>
        <span className="price">{formatRupees(item.price)}</span>
        <div className="quantity-control" aria-label={`${item.name} quantity`}>
          {quantity > 0 ? <><button type="button" aria-label={`Remove one ${item.name}`} onClick={() => changeQuantity(item.id, -1)}>−</button><span aria-live="polite">{quantity}</span></> : null}
          <button type="button" aria-label={`Add one ${item.name}`} onClick={() => changeQuantity(item.id, 1)}>+</button>
        </div>
      </article>
    })}</div>
    {count > 0 && <div className="cart-panel"><div><strong>{count} {count === 1 ? "dish" : "dishes"} · {formatRupees(total)}</strong><small>Pickup from the campus counter</small></div>{signedIn ? <button type="button" className="button" onClick={placeOrder} disabled={isPending}>{isPending ? "Sending order…" : "Place order"}</button> : <Link className="button" href="/sign-in">Sign in to order</Link>}</div>}
    {message && <p className={`feedback ${submitted ? "success" : ""}`} role="status">{message}{submitted && <> <Link href="/orders">View your orders</Link></>}</p>}
  </>
}
