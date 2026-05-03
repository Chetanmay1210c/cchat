import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#1a1a2e] pt-16 pb-8 px-5 border-t border-[#2d2d44]">
      <div className="max-w-6xl mx-auto">
        
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* Brand Info */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-[#e11d48] to-[#f43f5e]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="font-display text-white font-bold text-xl tracking-wide">
                CChat
              </span>
            </Link>
            <p className="text-[#9ca3af] text-sm leading-relaxed max-w-sm mb-6">
              Your private space to love and connect. A secure, intimate messaging app made exclusively for couples.
            </p>
          </div>

          {/* Links Column 1 */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-wide uppercase">Company</h4>
            <ul className="flex flex-col gap-3">
              <li><Link href="/" className="text-[#9ca3af] text-sm hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/about" className="text-[#9ca3af] text-sm hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/contact-us" className="text-[#9ca3af] text-sm hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-wide uppercase">Legal</h4>
            <ul className="flex flex-col gap-3">
              <li><Link href="/privacy" className="text-[#9ca3af] text-sm hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-[#9ca3af] text-sm hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/security" className="text-[#9ca3af] text-sm hover:text-white transition-colors">Security Details</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-[#2d2d44] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[#6b7280] text-xs text-center md:text-left">
            © {new Date().getFullYear()} CChat. Made with <span className="text-[#e11d48] animate-pulse inline-block">❤️</span> for couples everywhere.
          </p>
          
          {/* Small Trust Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#252538] border border-[#2d2d44]">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" fill="#10b981"/><path d="M7 11V7a5 5 0 0110 0v4" stroke="#10b981" strokeWidth="2" strokeLinecap="round"/></svg>
            <span className="text-[10px] text-[#10b981] font-semibold tracking-wide">End-to-End Encrypted</span>
          </div>
        </div>
      </div>
    </footer>
  );
}