import Link from "next/link";

export default function Footer() {
  return <footer className="footer" id="contact"><div className="container footer-grid"><div><Link href="/" className="brand footer-brand">SalonBook<span>.</span></Link><p>Beauty, care, and confidence — thoughtfully brought together.</p></div><div><h3>Explore</h3><Link href="/services">Our Services</Link><Link href="/#about">Our Story</Link><Link href="/#gallery">Gallery</Link></div><div><h3>Visit & Connect</h3><p>Find your moment of calm with SalonBook.</p><a href="mailto:hello@salonbook.example">hello@salonbook.example</a></div></div><div className="container footer-bottom"><span>© {new Date().getFullYear()} SalonBook. All rights reserved.</span><span>Made for your beautiful moments.</span></div></footer>;
}
