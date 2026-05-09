"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  // 🔥 AUTH CHECK FUNCTION
  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // run on mount + route change
  useEffect(() => {
    checkAuth();
  }, [pathname]); // 🔥 IMPORTANT FIX

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-md border-b">
      <div className="max-w-6xl mx-auto px-5 py-4 flex justify-between items-center">

        {/* LOGO */}
        <Link href="/" className="font-bold text-xl">
          CChat
        </Link>

        {/* NAV */}
        <div className="flex gap-6 items-center">

          <Link href="/">Home</Link>
          <Link href="/about">About</Link>

          {/* 🔥 AUTH BUTTON (FIXED) */}
          {loading ? (
            <span className="text-gray-400">...</span>
          ) : user ? (
            <Link
              href="/dashboard"
              className="bg-green-600 text-white px-5 py-2 rounded-full"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="bg-black text-white px-5 py-2 rounded-full"
            >
              Login
            </Link>
          )}
        </div>

      </div>
    </header>
  );
}