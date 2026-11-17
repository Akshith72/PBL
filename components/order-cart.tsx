"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { Coffee, Sandwich, Soup, Utensils } from "lucide-react"
import { createOrder } from "@/app/actions"
import { formatRupees } from "@/lib/format"
import { MENU_DAYS, type MenuDay } from "@/lib/menu-days"
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS, type PaymentMethod } from "@/lib/payment-methods"
import type { menuItems } from "@/lib/db/schema"

type MenuItem = typeof menuItems.$inferSelect
const dishIcons = [Soup, Sandwich, Utensils, Coffee]

type OrderCartProps = {
  items: MenuItem[]
  signedIn: boolean
  defaultDay: MenuDay
}

export function OrderCart({ items, signedIn, defaultDay }: OrderCartProps) {
  const [selectedDay, setSelectedDay] = useState<MenuDay>(defaultDay)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash")
  const [quantities, setQuantities] = useState<Record<number, number>>({})

  const [message, setMessage] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [isPending, startTransition] = useTransition()
  const dayItems = items.filter((item) => item.menuDay === null || item.menuDay === selectedDay)
  const count = Object.values(quantities).reduce((sum, quantity) => sum + quantity, 0)
  const total = dayItems.reduce((sum, item) => sum + item.price * (quantities[item.id] ?? 0), 0)

  function selectDay(day: MenuDay) {
    setSelectedDay(day)
    setQuantities({})
    setMessage("")
    setSubmitted(false)
  }

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
      const cart = Object.entries(quantities)
        .filter(([, quantity]) => quantity > 0)
        .map(([id, quantity]) => ({ id: Number(id), quantity }))
      const result = await createOrder(cart, selectedDay, paymentMethod)
      setMessage(result.message)
      setSubmitted(result.success)
      if (result.success) setQuantities({})
    })
  }

  if (items.length === 0) return <div className="surface empty-state"><h2>Nothing on the counter just yet</h2><p>The kitchen hasn&apos;t added a weekday menu. Please check back soon.</p></div>

  return <>
    <div className="menu-toolbar menu-day-toolbar">
      <div>
        <span className="day-selector-label">Choose a pickup day</span>
        <div className="day-selector" role="group" aria-label="Choose a menu day">
          {MENU_DAYS.map((day) => <button
            type="button"
            key={day}
            className={`day-tab${day === selectedDay ? " active" : ""}`}
            aria-pressed={day === selectedDay}
            onClick={() => selectDay(day)}
          >{day}</button>)}
        </div>
      </div>
      <span className="form-note">Everyday favorites appear all week · Prices in Indian rupees</span>
    </div>
    <h2 className="day-menu-heading">{selectedDay}&apos;s menu</h2>
    {dayItems.length ? <div className="menu-list">{dayItems.map((item, index) => {
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
    })}</div> : <div className="surface empty-state"><h3>No dishes for {selectedDay} yet</h3><p>Browse another day to see what the kitchen is preparing.</p></div>}
    {count > 0 && <div className="cart-panel"><div><strong>{count} {count === 1 ? "dish" : "dishes"} · {formatRupees(total)}</strong><small>Pickup on {selectedDay} at the campus counter</small></div><fieldset className="payment-options"><legend>Payment method</legend>{PAYMENT_METHODS.map((method) => <label key={method}><input type="radio" name="paymentMethod" value={method} checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} /><span>{PAYMENT_METHOD_LABELS[method]}</span></label>)}<small className="payment-note">Pay at pickup with your selected method.</small></fieldset>{signedIn ? <button type="button" className="button" onClick={placeOrder} disabled={isPending}>{isPending ? "Sending order…" : "Place order"}</button> : <Link className="button" href="/sign-in">Sign in to order</Link>}</div>}
    {message && <p className={`feedback ${submitted ? "success" : ""}`} role="status">{message}{submitted && <> <Link href="/orders">View your orders</Link></>}</p>}
  </>
}
