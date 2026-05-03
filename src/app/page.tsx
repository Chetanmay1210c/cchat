"use client";

import { useEffect, useRef, useState } from "react";

export default function CChatHomePage() {
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="min-h-screen bg-[#fafaf8] text-[#1a1a2e] font-sans overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; }

        body { font-family: 'DM Sans', sans-serif; }

        .font-display { font-family: 'Playfair Display', serif; }

        .dot-bg {
          background-color: #fafaf8;
          background-image: radial-gradient(circle, #d4c5b0 1px, transparent 1px);
          background-size: 28px 28px;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-12px) rotate(1deg); }
          66% { transform: translateY(-6px) rotate(-1deg); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(32px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulse-soft {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.97); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes heartBeat {
          0% { transform: scale(1); }
          14% { transform: scale(1.15); }
          28% { transform: scale(1); }
          42% { transform: scale(1.1); }
          70% { transform: scale(1); }
        }

        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-fade-up { animation: fadeUp 0.8s ease-out forwards; }
        .animate-fade-in { animation: fadeIn 1s ease-out forwards; }
        .animate-pulse-soft { animation: pulse-soft 3s ease-in-out infinite; }
        .animate-slide-in { animation: slideIn 0.6s ease-out forwards; }
        .animate-slide-in-right { animation: slideInRight 0.6s ease-out forwards; }
        .animate-heartbeat { animation: heartBeat 2.5s ease-in-out infinite; }

        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
        .delay-600 { animation-delay: 0.6s; }

        .chat-bubble-girl {
          background: linear-gradient(135deg, #ff8fa3 0%, #ff6b8a 100%);
          border-radius: 20px 20px 20px 4px;
          color: white;
        }
        .chat-bubble-boy {
          background: linear-gradient(135deg, #4f8ef7 0%, #2563eb 100%);
          border-radius: 20px 20px 4px 20px;
          color: white;
        }

        .glass-card {
          background: rgba(255,255,255,0.75);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.9);
          box-shadow: 0 8px 40px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04);
        }

        .trust-card {
          background: white;
          border: 1px solid #f0ebe3;
          box-shadow: 0 4px 24px rgba(0,0,0,0.06);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .trust-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.1);
        }

        .gradient-text-rose {
          background: linear-gradient(135deg, #e11d48 0%, #f97316 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .gradient-text-blue {
          background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .btn-primary {
          background: linear-gradient(135deg, #e11d48 0%, #f43f5e 100%);
          color: white;
          border: none;
          box-shadow: 0 4px 20px rgba(225,29,72,0.35);
          transition: all 0.3s ease;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(225,29,72,0.45);
        }

        .section-pill {
          background: linear-gradient(135deg, #fff1f2 0%, #fce7f3 100%);
          border: 1px solid #fecdd3;
          color: #e11d48;
        }

        .encryption-badge {
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          border: 1px solid #bbf7d0;
          color: #059669;
        }

        .lock-shine {
          background: linear-gradient(135deg, #059669 0%, #10b981 100%);
        }

        .phone-mockup {
          background: white;
          border: 2px solid #f0ebe3;
          box-shadow: 0 24px 80px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.08);
        }

        .love-card {
          border: 1px solid rgba(0,0,0,0.06);
        }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #fafaf8; }
        ::-webkit-scrollbar-thumb { background: #e11d48; border-radius: 2px; }

        @media (max-width: 640px) {
          .hero-title { font-size: 2.4rem !important; line-height: 1.1 !important; }
        }
      `}</style>

      {/* HERO */}
      <section ref={heroRef} className="dot-bg relative min-h-screen flex flex-col items-center justify-center px-5 pt-16 pb-24 overflow-hidden">
        <div className="absolute top-[-80px] left-[-80px] w-[320px] h-[320px] rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #fda4af, transparent)" }} />
        <div className="absolute bottom-[-60px] right-[-60px] w-[280px] h-[280px] rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #93c5fd, transparent)" }} />

        {/* App name */}
        <div className="animate-fade-in opacity-0 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center btn-primary shadow-lg">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-display text-2xl font-bold text-[#1a1a2e]">CChat</span>
          </div>
        </div>

        {/* Headline */}
        <div className="text-center max-w-sm mx-auto mb-8 animate-fade-up opacity-0 delay-100">
          <h1 className="font-display hero-title text-[2.8rem] font-bold leading-[1.08] text-[#1a1a2e] mb-4">
            Your private space
            <span className="block gradient-text-rose italic">to love & connect.</span>
          </h1>
          <p className="text-[#6b7280] text-base leading-relaxed font-light">
            A safe, intimate messaging app made for couples and partners — where every word stays between just the two of you.
          </p>
        </div>

        {/* Phone mockup */}
        <div className="animate-float animate-fade-up opacity-0 delay-200 w-full max-w-[280px] mx-auto mb-10">
          <div className="phone-mockup rounded-[36px] overflow-hidden p-5">
            <div className="flex justify-between items-center mb-4 px-1">
              <span className="text-xs text-[#9ca3af] font-medium">9:41</span>
              <div className="flex gap-1">
                <div className="w-4 h-2 bg-[#1a1a2e] rounded-sm opacity-60"></div>
                <div className="w-2 h-2 bg-[#1a1a2e] rounded-full opacity-60"></div>
              </div>
            </div>
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[#f5f0ea]">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-300 to-rose-400 flex items-center justify-center text-white text-sm font-bold">A</div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <p className="font-semibold text-sm text-[#1a1a2e]">Aanya ✨</p>
                <p className="text-xs text-emerald-500">Online now</p>
              </div>
              <div className="ml-auto">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#f43f5e"/></svg>
              </div>
            </div>
            <div className="space-y-3">
              <div className="animate-slide-in opacity-0 delay-300 flex justify-start">
                <div className="chat-bubble-girl px-4 py-2.5 max-w-[75%]">
                  <p className="text-xs font-medium">Good morning 🌸</p>
                </div>
              </div>
              <div className="animate-slide-in-right opacity-0 delay-400 flex justify-end">
                <div className="chat-bubble-boy px-4 py-2.5 max-w-[75%]">
                  <p className="text-xs font-medium">Morning! Missed you 💙</p>
                </div>
              </div>
              <div className="animate-slide-in opacity-0 delay-500 flex justify-start">
                <div className="chat-bubble-girl px-4 py-2.5 max-w-[75%]">
                  <p className="text-xs font-medium">What's our plan today? 🥰</p>
                </div>
              </div>
              <div className="animate-slide-in-right opacity-0 delay-600 flex justify-end">
                <div className="chat-bubble-boy px-4 py-2.5 max-w-[75%]">
                  <p className="text-xs font-medium">Surprise! 🎁</p>
                </div>
              </div>
              <div className="flex justify-start mt-1">
                <div className="bg-[#f5f0ea] rounded-full px-4 py-2.5 flex gap-1.5 items-center">
                  <div className="w-1.5 h-1.5 bg-[#9ca3af] rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                  <div className="w-1.5 h-1.5 bg-[#9ca3af] rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                  <div className="w-1.5 h-1.5 bg-[#9ca3af] rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-[#f5f0ea] flex items-center justify-center gap-1.5">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" fill="#10b981"/><path d="M7 11V7a5 5 0 0110 0v4" stroke="#10b981" strokeWidth="2" strokeLinecap="round"/></svg>
              <span className="text-[10px] text-emerald-600 font-semibold tracking-wide">End-to-End Encrypted</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="animate-fade-up opacity-0 delay-400 w-full max-w-xs">
          <button className="btn-primary w-full py-4 rounded-2xl font-semibold text-base cursor-pointer">
            Start Chatting — Free
          </button>
        </div>
        <p className="animate-fade-in opacity-0 delay-500 text-xs text-[#9ca3af] mt-4 text-center">
          No ads · No selling data · Always free for couples
        </p>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
          <div className="w-[1px] h-8 bg-gradient-to-b from-transparent to-[#e11d48]"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-[#e11d48] animate-pulse-soft"></div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="dot-bg py-20 px-5">
        <div className="max-w-md mx-auto text-center mb-12">
          <div className="section-pill inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-5 tracking-wide uppercase">
            How It Works
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#1a1a2e] leading-tight mb-4">
            Made for two.
            <span className="block gradient-text-rose italic">Just you & them.</span>
          </h2>
          <p className="text-[#6b7280] text-sm leading-relaxed">CChat creates a private, exclusive space for you and your partner — no distractions, no group chats, no noise.</p>
        </div>
        <div className="max-w-md mx-auto grid grid-cols-1 gap-4">
          {[
            { icon: "💑", title: "Invite your partner", desc: "Sign up and send one invite link to your partner. Only you two share this space.", color: "from-rose-50 to-pink-50", border: "border-pink-100" },
            { icon: "💬", title: "Chat freely & privately", desc: "Message, share photos, voice notes, and feelings — everything stays between you.", color: "from-blue-50 to-indigo-50", border: "border-blue-100" },
            { icon: "🔐", title: "Protected always", desc: "Every message is end-to-end encrypted. Not even we can read what you share.", color: "from-emerald-50 to-teal-50", border: "border-emerald-100" }
          ].map((item, i) => (
            <div key={i} className={`trust-card rounded-2xl p-5 flex gap-4 items-start bg-gradient-to-br ${item.color} border ${item.border}`}>
              <div className="text-3xl">{item.icon}</div>
              <div>
                <h3 className="font-semibold text-[#1a1a2e] mb-1">{item.title}</h3>
                <p className="text-[#6b7280] text-sm leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRIVACY SECTION */}
      <section className="py-20 px-5 bg-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "radial-gradient(circle, #1a1a2e 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
        <div className="max-w-md mx-auto relative">
          <div className="text-center mb-12">
            <div className="encryption-badge inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-5 tracking-wide uppercase">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" fill="currentColor" fillOpacity="0.8"/><path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>
              Privacy & Security
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#1a1a2e] leading-tight mb-4">
              What you share
              <span className="block gradient-text-blue italic">is yours. Forever.</span>
            </h2>
            <p className="text-[#6b7280] text-sm leading-relaxed">We built CChat on one core belief: your private conversations are sacred and should stay private.</p>
          </div>

          <div className="glass-card rounded-3xl p-7 mb-6 text-center border border-emerald-100">
            <div className="w-16 h-16 lock-shine rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="11" width="18" height="11" rx="2" fill="white" fillOpacity="0.9"/>
                <path d="M7 11V7a5 5 0 0110 0v4" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                <circle cx="12" cy="16" r="1.5" fill="#059669"/>
              </svg>
            </div>
            <h3 className="font-display text-2xl font-bold text-[#1a1a2e] mb-2">256-bit Encrypted</h3>
            <p className="text-[#6b7280] text-sm leading-relaxed">Military-grade encryption wraps every single message, photo, and voice note before it leaves your device.</p>
          </div>

          <div className="space-y-3">
            {[
              { icon: "🚫", title: "We cannot read your messages", desc: "Zero-knowledge architecture means even our engineers have no access to your conversations.", badge: "Guaranteed" },
              { icon: "📵", title: "No ads. No tracking.", desc: "Your chat data is never sold, shared, or used for advertising. We make money through optional features, never your data.", badge: "Always" },
              { icon: "🗑️", title: "You control deletion", desc: "Delete any message or your entire history anytime. It's gone from our servers within 24 hours — permanently.", badge: "Your choice" },
            ].map((item, i) => (
              <div key={i} className="trust-card rounded-2xl p-5 flex gap-4">
                <div className="text-2xl flex-shrink-0 mt-0.5">{item.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold text-[#1a1a2e] text-sm">{item.title}</h3>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full tracking-wide">{item.badge}</span>
                  </div>
                  <p className="text-[#6b7280] text-xs leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 glass-card rounded-2xl p-6 border border-[#f0ebe3]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-[#1a1a2e]">Trust Score</span>
              <span className="text-sm font-bold text-emerald-600">99.9%</span>
            </div>
            <div className="h-2 bg-[#f5f0ea] rounded-full overflow-hidden mb-4">
              <div className="h-full rounded-full" style={{ width: "99.9%", background: "linear-gradient(90deg, #10b981, #059669)" }}></div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { value: "0", label: "Data breaches", icon: "✅" },
                { value: "100%", label: "Encrypted msgs", icon: "🔐" },
                { value: "0", label: "Ads served", icon: "🚫" }
              ].map((stat, i) => (
                <div key={i} className="bg-[#fafaf8] rounded-xl p-3">
                  <div className="text-lg mb-0.5">{stat.icon}</div>
                  <div className="font-bold text-[#1a1a2e] text-sm">{stat.value}</div>
                  <div className="text-[10px] text-[#9ca3af] leading-tight">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* LOVE SECTION */}
      <section className="dot-bg py-20 px-5">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-12">
            <div className="section-pill inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-5 tracking-wide uppercase">
              <span className="animate-heartbeat inline-block">❤️</span>
              Made with Love
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#1a1a2e] leading-tight mb-4">
              Love deserves a
              <span className="block gradient-text-rose italic">safe home.</span>
            </h2>
            <p className="text-[#6b7280] text-sm leading-relaxed">CChat isn't just an app — it's a promise. A protected place where your love story can grow, without fear.</p>
          </div>

          <div className="space-y-4 mb-10">
            {[
              { quote: "Distance means nothing when someone means everything.", sub: "CChat keeps you close, no matter how far apart.", gradient: "from-rose-50 to-pink-100", icon: "💕" },
              { quote: "Every 'good morning' text, every late-night secret — they belong only to you two.", sub: "Zero surveillance. Zero data mining. Just love.", gradient: "from-blue-50 to-indigo-100", icon: "🌙" },
              { quote: "Trust is the foundation of every great relationship.", sub: "We built CChat on that exact foundation.", gradient: "from-amber-50 to-orange-50", icon: "🏡" }
            ].map((card, i) => (
              <div key={i} className={`love-card rounded-2xl p-6 bg-gradient-to-br ${card.gradient}`}>
                <div className="text-3xl mb-3">{card.icon}</div>
                <blockquote className="font-display italic text-[#1a1a2e] text-lg font-medium leading-snug mb-2">
                  "{card.quote}"
                </blockquote>
                <p className="text-[#6b7280] text-sm">{card.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-10">
            {[
              { emoji: "🎤", title: "Voice messages", desc: "Hear their voice anytime" },
              { emoji: "📸", title: "Photo sharing", desc: "Your moments, secured" },
              { emoji: "⏱️", title: "Disappearing msgs", desc: "Secrets that vanish" },
              { emoji: "💌", title: "Love letters", desc: "Long-form feelings" },
              { emoji: "🔔", title: "Private alerts", desc: "Only you see these" },
              { emoji: "🌍", title: "Global reach", desc: "Works anywhere" }
            ].map((feat, i) => (
              <div key={i} className="glass-card rounded-2xl p-4 border border-[#f0ebe3]">
                <div className="text-2xl mb-2">{feat.emoji}</div>
                <h3 className="font-semibold text-[#1a1a2e] text-sm mb-0.5">{feat.title}</h3>
                <p className="text-[#9ca3af] text-xs">{feat.desc}</p>
              </div>
            ))}
          </div>

          <div className="space-y-4 mb-12">
            <h3 className="font-display text-xl font-bold text-[#1a1a2e] text-center mb-6">Couples love CChat</h3>
            {[
              { name: "Priya & Arjun", location: "Mumbai · Together 2 years", review: "CChat gave us a space that truly feels like ours. No ads, no noise — just us.", avatar: "P" },
              { name: "Sneha & Rahul", location: "Delhi · Long distance", review: "Knowing our chats are encrypted makes everything feel so much safer. We trust CChat completely.", avatar: "S" }
            ].map((t, i) => (
              <div key={i} className="trust-card rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm">{t.avatar}</div>
                  <div>
                    <p className="font-semibold text-[#1a1a2e] text-sm">{t.name}</p>
                    <p className="text-[#9ca3af] text-xs">{t.location}</p>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {[...Array(5)].map((_, j) => <span key={j} className="text-amber-400 text-xs">★</span>)}
                  </div>
                </div>
                <p className="text-[#4b5563] text-sm italic leading-relaxed">"{t.review}"</p>
              </div>
            ))}
          </div>

          {/* Final CTA */}
          <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-3xl p-8 text-center text-white shadow-xl">
            <div className="text-5xl mb-4 animate-heartbeat inline-block">💑</div>
            <h3 className="font-display text-2xl font-bold mb-3">Ready to build your private world?</h3>
            <p className="text-rose-100 text-sm mb-6 leading-relaxed">Join thousands of couples who chose privacy, trust, and love — all in one place.</p>
            <button className="bg-white text-rose-600 font-bold py-4 px-8 rounded-2xl w-full text-base shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5 cursor-pointer mb-3">
              Start for Free — No credit card
            </button>
            <p className="text-rose-200 text-xs">🔐 End-to-end encrypted · 💙 Always private · ❤️ Made for two</p>
          </div>
        </div>
      </section>

      {/* FOOTER BAR */}
      <div className="bg-[#1a1a2e] py-8 px-5">
        <div className="max-w-md mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center btn-primary">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-display text-white font-bold text-lg">CChat</span>
          </div>
          <p className="text-[#6b7280] text-xs mb-4">Your private love space. Protected. Always.</p>
          <div className="flex justify-center gap-5 text-[#4b5563] text-xs">
            <span className="hover:text-rose-400 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-rose-400 cursor-pointer transition-colors">Terms</span>
            <span className="hover:text-rose-400 cursor-pointer transition-colors">Contact</span>
          </div>
          <p className="text-[#374151] text-[10px] mt-4">© 2026 CChat. Made with ❤️ for couples everywhere.</p>
        </div>
      </div>
    </main>
  );
}