"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const { data: session, isPending } = authClient.useSession();

  const isLoggedIn = !!session?.user;

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
    ...(isLoggedIn
      ? [
          { label: "My Dashboard", href: "/dashboard" },
          { label: "My Profile", href: "/profile" },
        ]
      : []),
  ];

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  async function handleLogout() {
    setLoggingOut(true);

    try {
      const result = await authClient.signOut();

      if (result.error) {
        throw new Error(result.error.message || "Logout failed");
      }

      setMenuOpen(false);
      router.replace("/");
      router.refresh();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to sign out. Please try again.",
      );
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[#EADDD6] bg-[#FFFCF9]/95 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-5 px-5 md:px-8">
        <Link
          href="/"
          onClick={() => setMenuOpen(false)}
          className="font-serif text-3xl tracking-wide text-[#984E59]"
        >
          SalonBook
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "text-[#984E59]"
                  : "text-[#665B58] hover:text-[#984E59]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {!isPending &&
            (isLoggedIn ? (
              <>
                <span className="max-w-36 truncate text-sm text-[#665B58]">
                  {session.user.name}
                </span>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="bg-[#984E59] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white disabled:opacity-60"
                >
                  {loggingOut ? "Signing Out..." : "Logout"}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-[#984E59]"
                >
                  Sign In
                </Link>

                <Link
                  href="/register"
                  className="bg-[#984E59] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white"
                >
                  Join Us
                </Link>
              </>
            ))}
        </div>

        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex h-11 w-11 items-center justify-center border border-[#EADDD6] text-[#984E59] lg:hidden"
        >
          {menuOpen ? (
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          )}
        </button>
      </div>

      {menuOpen && (
        <nav
          id="mobile-navigation"
          className="border-t border-[#EADDD6] bg-[#FFFCF9] px-5 py-5 lg:hidden"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`px-4 py-3 text-sm ${
                  isActive(link.href)
                    ? "bg-[#F8F0EB] font-semibold text-[#984E59]"
                    : "text-[#665B58]"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {!isPending && (
              <div className="mt-3 border-t border-[#EADDD6] pt-5">
                {isLoggedIn ? (
                  <div className="space-y-3">
                    <p className="px-4 text-sm text-[#665B58]">
                      Signed in as {session.user.name}
                    </p>

                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="w-full bg-[#984E59] px-4 py-3 text-sm text-white disabled:opacity-60"
                    >
                      {loggingOut ? "Signing Out..." : "Logout"}
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      href="/login"
                      onClick={() => setMenuOpen(false)}
                      className="border border-[#984E59] px-4 py-3 text-center text-sm text-[#984E59]"
                    >
                      Sign In
                    </Link>

                    <Link
                      href="/register"
                      onClick={() => setMenuOpen(false)}
                      className="bg-[#984E59] px-4 py-3 text-center text-sm text-white"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
