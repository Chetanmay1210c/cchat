"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // scroll effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // auth check 🔥 IMPORTANT PART
  useEffect(() => {
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

    checkAuth();
  }, []);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact-us" },
  ];

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "py-3 bg-white/70 backdrop-blur-md border-b border-[#f0ebe3] shadow-sm"
          : "py-5 bg-transparent"
      }`}>

        <div className="max-w-6xl mx-auto px-5 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#e11d48] to-[#f43f5e] flex items-center justify-center text-white font-bold">
              C
            </div>
            <span className="font-bold text-xl">CChat</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-8">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.path} className="text-gray-600 hover:text-pink-600">
                {link.name}
              </Link>
            ))}
          </nav>

          {/* AUTH BUTTON 🔥 FIX */}
          <div className="hidden md:block">
            {loading ? (
              <div className="text-sm text-gray-400">...</div>
            ) : user ? (
              <Link
                href="/dashboard"
                className="bg-green-600 text-white px-6 py-2 rounded-full"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="bg-black text-white px-6 py-2 rounded-full"
              >
                Login
              </Link>
            )}
          </div>

        </div>
      </header>
    </>
  );
}