import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SalonBook | Beauty, Made Personal",
  description: "Discover elevated beauty and self-care experiences at SalonBook.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
