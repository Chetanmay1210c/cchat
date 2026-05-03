"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle scroll to add glassmorphism effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isMobileMenuOpen]);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact-us" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "py-3 bg-white/70 backdrop-blur-md border-b border-[#f0ebe3] shadow-sm"
            : "py-5 bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-5 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group relative z-50">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#e11d48] to-[#f43f5e] shadow-md group-hover:scale-105 transition-transform duration-300">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-display text-xl font-bold text-[#1a1a2e] tracking-wide">
              CChat
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.path}
                className="text-[#6b7280] text-sm font-medium hover:text-[#e11d48] transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Login Button */}
          <div className="hidden md:block">
            <Link 
              href="/login"
              className="bg-[#1a1a2e] text-white text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-[#e11d48] transition-colors shadow-md hover:shadow-lg hover:-translate-y-0.5 duration-300 inline-block"
            >
              Login
            </Link>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button 
            className="md:hidden relative z-50 p-2 -mr-2 text-[#1a1a2e] focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            )}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 z-40 bg-[#fafaf8] transition-transform duration-500 ease-in-out flex flex-col justify-center px-8 ${
          isMobileMenuOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        {/* Soft floating background blobs for mobile menu */}
        <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] rounded-full opacity-20 blur-3xl bg-radial-gradient from-[#fda4af] to-transparent pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[250px] h-[250px] rounded-full opacity-20 blur-3xl bg-radial-gradient from-[#93c5fd] to-transparent pointer-events-none" />

        <nav className="flex flex-col gap-6 relative z-10">
          {navLinks.map((link, index) => (
            <Link 
              key={link.name} 
              href={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className="font-display text-4xl font-bold text-[#1a1a2e] hover:text-[#e11d48] transition-colors border-b border-[#f0ebe3] pb-4"
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              {link.name}
            </Link>
          ))}
          <Link 
            href="/login"
            onClick={() => setIsMobileMenuOpen(false)}
            className="mt-6 flex items-center justify-center gap-2 bg-gradient-to-br from-[#e11d48] to-[#f43f5e] text-white text-lg font-bold px-8 py-4 rounded-2xl shadow-xl active:scale-95 transition-transform"
          >
            Login to your space
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
          </Link>
        </nav>

        <div className="absolute bottom-10 left-0 right-0 text-center text-[#9ca3af] text-xs font-medium">
          🔐 Made for couples. Always private.
        </div>
      </div>
    </>
  );
}