import type { Metadata } from "next";
import "@/index.css";

export const metadata: Metadata = {
  title: "NexolPay — Escrow and Scheduled Payments",
  description: "Secure agreements with escrow and schedule predictable stablecoin payments.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
