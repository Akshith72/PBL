"use server"

import { and, desc, eq, inArray, isNull, or } from "drizzle-orm"
import { randomInt } from "node:crypto"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { campusOrderItems, campusOrders, contactMessages, menuItems } from "@/lib/db/schema"
import { requireCampusAdmin } from "@/lib/authorization"
import { headers } from "next/headers"
import { MENU_DAYS } from "@/lib/menu-days"

const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email().max(254),
  message: z.string().trim().min(10).max(2000),
})

export type ContactState = { message: string; success: boolean }

export async function sendContactMessage(_previous: ContactState, formData: FormData): Promise<ContactState> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
  })
  if (!parsed.success) return { message: "Please check the form and try again.", success: false }
  const session = await auth.api.getSession({ headers: await headers() })
  await db.insert(contactMessages).values({
    userId: session?.user.id ?? null,
    name: parsed.data.name,
    email: parsed.data.email,
    message: parsed.data.message,
  })
  revalidatePath("/manage")
  return { message: "Thanks — your message is in our inbox.", success: true }
}

const cartSchema = z.array(z.object({ id: z.number().int().positive(), quantity: z.number().int().min(1).max(20) })).min(1).max(30)

export async function createOrder(input: unknown, menuDayInput: unknown) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return { success: false, message: "Sign in before placing an order." }
  const selectedDay = z.enum(MENU_DAYS).safeParse(menuDayInput)
  if (!selectedDay.success) return { success: false, message: "Choose a valid menu day." }
  const parsed = cartSchema.safeParse(input)
  if (!parsed.success) return { success: false, message: "Your cart needs at least one valid item." }

  const quantities = new Map<number, number>()
  for (const item of parsed.data) quantities.set(item.id, (quantities.get(item.id) ?? 0) + item.quantity)
  if ([...quantities.values()].some((quantity) => quantity > 20)) {
    return { success: false, message: "You can order up to 20 of each dish." }
  }

  const ids = [...quantities.keys()]
  const availableItems = await db.select().from(menuItems).where(and(
    inArray(menuItems.id, ids),
    eq(menuItems.available, true),
    or(isNull(menuItems.menuDay), eq(menuItems.menuDay, selectedDay.data)),
  ))
  if (availableItems.length !== ids.length) return { success: false, message: "A dish in your cart is no longer available. Refresh the menu and try again." }

  const total = availableItems.reduce((sum, item) => sum + item.price * (quantities.get(item.id) ?? 0), 0)
  if (!Number.isSafeInteger(total) || total < 1) return { success: false, message: "We could not calculate that order." }
  const code = `CE-${Date.now().toString(36).toUpperCase()}-${randomInt(100, 1000)}`

  const order = await db.transaction(async (transaction) => {
    const [created] = await transaction.insert(campusOrders).values({
      code,
      userId: session.user.id,
      total,
      status: "received",
      pickupDay: selectedDay.data,
    }).returning()
    await transaction.insert(campusOrderItems).values(availableItems.map((item) => ({
      orderId: created.id,
      userId: session.user.id,
      menuItemId: item.id,
      itemName: item.name,
      quantity: quantities.get(item.id) ?? 1,
      unitPrice: item.price,
    })))
    return created
  })
  revalidatePath("/orders")
  revalidatePath("/manage")
  return { success: true, message: `Order ${order.code} is in the kitchen.` }
}

const menuItemSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(240).default(""),
  category: z.string().trim().min(2).max(40),
  price: z.coerce.number().int().positive().max(100000),
  menuDay: z.enum(MENU_DAYS).nullable(),
})

export async function saveMenuItem(formData: FormData) {
  await requireCampusAdmin()
  const parsed = menuItemSchema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    category: formData.get("category"),
    price: formData.get("price"),
    menuDay: formData.get("menuDay") || null,
  })
  if (!parsed.success) redirect("/manage?error=invalid-item")
  const { id, ...values } = parsed.data
  if (id) {
    await db.update(menuItems).set({ ...values, updatedAt: new Date() }).where(eq(menuItems.id, id))
  } else {
    await db.insert(menuItems).values(values)
  }
  revalidatePath("/menu")
  revalidatePath("/manage")
  redirect("/manage?saved=1")
}

export async function toggleMenuAvailability(formData: FormData) {
  await requireCampusAdmin()
  const id = Number(formData.get("id"))
  if (!Number.isSafeInteger(id) || id < 1) redirect("/manage?error=invalid-item")
  const [item] = await db.select({ available: menuItems.available }).from(menuItems).where(eq(menuItems.id, id)).limit(1)
  if (!item) redirect("/manage?error=missing-item")
  await db.update(menuItems).set({ available: !item.available, updatedAt: new Date() }).where(eq(menuItems.id, id))
  revalidatePath("/menu")
  revalidatePath("/manage")
  redirect("/manage?saved=1")
}

const orderStatusSchema = z.enum(["received", "preparing", "ready", "collected", "cancelled"])

export async function updateOrderStatus(formData: FormData) {
  await requireCampusAdmin()
  const id = String(formData.get("id") ?? "")
  const status = orderStatusSchema.safeParse(formData.get("status"))
  if (!/^[0-9a-f-]{36}$/i.test(id) || !status.success) redirect("/manage?error=invalid-order")
  await db.update(campusOrders).set({ status: status.data, updatedAt: new Date() }).where(eq(campusOrders.id, id))
  revalidatePath("/manage")
  revalidatePath("/orders")
  redirect("/manage?saved=1")
}

export async function getOrdersWithItems() {
  const orders = await db.select().from(campusOrders).orderBy(desc(campusOrders.createdAt)).limit(100)
  if (!orders.length) return { orders, items: [] as (typeof campusOrderItems.$inferSelect)[] }
  const items = await db.select().from(campusOrderItems).where(inArray(campusOrderItems.orderId, orders.map((order) => order.id)))
  return { orders, items }
}
