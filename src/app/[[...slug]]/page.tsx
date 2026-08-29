"use client";

import { useEffect, useState } from "react";
import App from "@/App";

export default function ApplicationPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="min-h-screen bg-background" aria-label="Loading NexolPay" />;
  return <App />;
}
