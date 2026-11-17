import Link from "next/link"
import { ArrowRight, Clock3, Leaf, ShieldCheck, Sparkles, Star, Utensils } from "lucide-react"
import { and, eq, isNull, or } from "drizzle-orm"
import { db } from "@/lib/db"
import { menuItems } from "@/lib/db/schema"
import { formatRupees } from "@/lib/format"
import { getCurrentMenuDay } from "@/lib/menu-days"

export default async function HomePage() {
  const today = getCurrentMenuDay()
  const dishes = await db.select().from(menuItems).where(and(
    eq(menuItems.available, true),
    or(isNull(menuItems.menuDay), eq(menuItems.menuDay, today)),
  )).limit(4)

  return (
    <main className="main">
      <section className="container hero">
        <div className="hero-copy">
          <span className="eyebrow"><span className="eyebrow-dot" />Made for campus life</span>
          <h1 className="display">A little more lunch. <span>A lot less line.</span></h1>
          <p>Fresh campus favorites, ready when you are. Browse what&apos;s cooking, order ahead, and spend your break how you want.</p>
          <div className="hero-actions">
            <Link href="/menu" className="button">Explore the menu <ArrowRight size={16} /></Link>
            <span className="hero-note">Made fresh. Picked up on campus.</span>
          </div>
        </div>
        <div className="hero-visual" aria-label="Campus dining feature">
          <div className="hero-card">
            <div className="hero-card-top"><div><div className="hero-card-tag">Today&apos;s campus pick</div><h2>Good food, right on time.</h2></div><Sparkles size={22} color="#f3d16b" /></div>
            <div className="hero-food"><div className="food-plate"><Utensils size={54} color="#234d3a" strokeWidth={1.7} /></div></div>
            <div className="hero-card-bottom"><span className="rating"><Star size={14} fill="currentColor" /> Fresh from the canteen</span><span className="hero-card-tag">Order ahead</span></div>
          </div>
          <div className="hero-bubble"><Clock3 size={15} style={{ verticalAlign: "-3px", marginRight: 5 }} /> Skip the queue <small>Your break, back in your hands.</small></div>
        </div>
      </section>

      <section className="container stats-row" aria-label="CampusEats at a glance">
        <div className="stat"><strong>Fresh</strong><span>Made on campus</span></div>
        <div className="stat"><strong>Easy</strong><span>Order in a few taps</span></div>
        <div className="stat"><strong>Yours</strong><span>Track every pickup</span></div>
      </section>

      <section className="container menu-preview">
        <div className="section-heading"><div><span className="eyebrow"><span className="eyebrow-dot" />On the menu</span><h2>Today&apos;s favorites</h2></div><Link href="/menu" className="button button-outline button-small">See full menu <ArrowRight size={14} /></Link></div>
        {dishes.length ? <div className="menu-grid">{dishes.map((dish, index) => <article className="menu-card" key={dish.id}><div className="dish-icon"><Leaf size={22} /></div><h3>{dish.name}</h3><p>{dish.description || "Freshly prepared in our campus kitchen."}</p><div className="menu-card-bottom"><span className="price">{formatRupees(dish.price)}</span><span className="form-note">{dish.category}</span></div></article>)}</div> : <div className="surface empty-state"><h2>Fresh dishes are on their way</h2><p>Check back soon for today&apos;s menu.</p></div>}
      </section>

      <section className="container feature-band" aria-label="Why CampusEats">
        <div className="feature"><span className="feature-icon"><Clock3 size={18} /></span><div><h3>Order on your time</h3><p>Place your order between classes and choose pickup when it suits you.</p></div></div>
        <div className="feature"><span className="feature-icon"><ShieldCheck size={18} /></span><div><h3>Your orders, in one place</h3><p>Sign in to follow the kitchen status and see your order history.</p></div></div>
        <div className="feature"><span className="feature-icon"><Leaf size={18} /></span><div><h3>Made right here</h3><p>See what&apos;s available today, straight from your campus kitchen.</p></div></div>
      </section>
    </main>
  )
}
