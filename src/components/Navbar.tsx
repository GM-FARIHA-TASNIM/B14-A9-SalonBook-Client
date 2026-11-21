"use client";

import Link from "next/link";
import { useState } from "react";

const links = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "About", href: "/#about" },
  { label: "Gallery", href: "/#gallery" },
  { label: "Contact", href: "/#contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="nav-inner container">
        <Link className="brand" href="/" onClick={() => setOpen(false)}>SalonBook<span>.</span></Link>
        <nav className={open ? "nav-links is-open" : "nav-links"} aria-label="Main navigation">
          {links.map((link) => <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}</Link>)}
          <Link className="mobile-book" href="/services" onClick={() => setOpen(false)}>Book Appointment</Link>
        </nav>
        <div className="nav-actions">
          <Link className="nav-signin" href="/login">Sign In</Link>
          <Link className="button button-small" href="/services">Book Now <span aria-hidden="true">↗</span></Link>
          <button className="menu-toggle" type="button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? "✕" : "☰"}</button>
        </div>
      </div>
    </header>
  );
}
