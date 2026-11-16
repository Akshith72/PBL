import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <Link href="/" className="brand"><span className="brand-mark">C</span><span className="brand-text">campus<span>eats</span></span></Link>
        <span>Good food. More time for campus life.</span>
        <span>© {new Date().getFullYear()} CampusEats</span>
      </div>
    </footer>
  )
}
