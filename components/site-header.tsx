import Image from "next/image"
import Link from "next/link"
import { AccountActions } from "@/components/account-actions"
import { getSession, isCampusAdmin } from "@/lib/authorization"

export async function SiteHeader() {
  const session = await getSession()
  const admin = session?.user ? await isCampusAdmin(session.user.email) : false
  return (
    <header className="site-header">
      <Link href="/" className="brand" aria-label="CampusEats home">
        <span className="brand-mark"><Image src="/CampusEats%20Steam.png" alt="" width={40} height={40} priority /></span>
        <span className="brand-text">campus<span>eats</span></span>
      </Link>
      <nav className="site-nav" aria-label="Main navigation">
        <Link href="/">Home</Link><Link href="/menu">Menu</Link><Link href="/orders">My orders</Link><Link href="/contact">Contact</Link>
      </nav>
      <AccountActions signedIn={Boolean(session?.user)} name={session?.user.name} admin={admin} />
    </header>
  )
}
