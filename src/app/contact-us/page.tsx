import { headers } from "next/headers";
import { MessageCircleHeart, Sparkles, Heart } from "lucide-react";
import ContactClient from "./ContactClient";

const MAX_MESSAGES = 3;
const COOLDOWN_SECONDS = 600; // 10 minutes

// In-memory rate limit store (Swap out for Redis cache/database in true multi-server production environments)
const ipStore = new Map<string, { count: number; firstSent: number }>();

function getRateLimitStatus(ip: string): { blocked: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const record = ipStore.get(ip);

  if (!record) return { blocked: false, remaining: MAX_MESSAGES, resetIn: 0 };

  const elapsed = Math.floor((now - record.firstSent) / 1000);

  // Time Window completely expired — clean slate
  if (elapsed >= COOLDOWN_SECONDS) {
    ipStore.delete(ip);
    return { blocked: false, remaining: MAX_MESSAGES, resetIn: 0 };
  }

  const remaining = Math.max(0, MAX_MESSAGES - record.count);
  const resetIn = COOLDOWN_SECONDS - elapsed;
  return { blocked: record.count >= MAX_MESSAGES, remaining, resetIn };
}

interface SearchParams {
  error?: string;
  reset?: string;
}

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headersList.get("x-real-ip") ??
    "unknown";

  const { blocked, remaining, resetIn } = getRateLimitStatus(ip);
  const errorType = params.error ?? null;

  // Next.js Server Action running natively inside container architecture
  async function sendContactMessage(formData: FormData) {
    "use server";

    const serverHeaders = await headers();
    const serverIp =
      serverHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      serverHeaders.get("x-real-ip") ??
      "unknown";

    const name = (formData.get("name") as string | null)?.trim() ?? "";
    const message = (formData.get("message") as string | null)?.trim() ?? "";

    // ── Server-Side Structural Validation ───────────────────────────────────
    if (name.length < 2 || name.length > 50) {
      return { success: false, errorType: "name" };
    }

    const wordCount = message === "" ? 0 : message.split(/\s+/).length;
    if (wordCount < 2 || wordCount > 500) {
      return { success: false, errorType: "message" };
    }

    // ── Rate Limiting Assessment ──────────────────────────────────────────
    const status = getRateLimitStatus(serverIp);
    if (status.blocked) {
      return { success: false, errorType: "ratelimit", resetIn: status.resetIn };
    }

    // ── Incrementing Actions Record ─────────────────────────────────────────
    const existing = ipStore.get(serverIp);
    if (existing) {
      existing.count += 1;
    } else {
      ipStore.set(serverIp, { count: 1, firstSent: Date.now() });
    }

    // ── TODO: Insert secure system integrations safely here ───────────────
    // e.g. await sendEmail({ name, message });
    // e.g. await db.insert(contactMessages).values({ name, message, ip: serverIp });

    const updatedRecord = ipStore.get(serverIp)!;
    const finalRemaining = Math.max(0, MAX_MESSAGES - updatedRecord.count);

    return { success: true, remaining: finalRemaining };
  }

  return (
    <div className="min-h-screen bg-[#fffbfb] text-[#2d1b2e] overflow-x-hidden relative">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-display { font-family: 'Playfair Display', serif; }
        
        .romantic-bg {
          background-color: #fffbfb;
          background-image: 
            radial-gradient(at 0% 0%, hsla(353,100%,93%,1) 0px, transparent 50%),
            radial-gradient(at 100% 100%, hsla(340,100%,90%,1) 0px, transparent 50%);
        }

        @keyframes fadeUp { from{opacity:0;transform:translateY(30px);} to{opacity:1;transform:translateY(0);} }
        @keyframes fadeIn { from{opacity:0;} to{opacity:1;} }
        @keyframes float { 
          0%, 100% { transform: translateY(0) rotate(-3deg); } 
          50% { transform: translateY(-15px) rotate(3deg); } 
        }
        @keyframes pulseGlow { 
          0% { box-shadow: 0 0 0 0 rgba(225,29,72,0.3); } 
          70% { box-shadow: 0 0 0 20px rgba(225,29,72,0); } 
          100% { box-shadow: 0 0 0 0 rgba(225,29,72,0); } 
        }
        @keyframes floatUpFade {
          0% { opacity: 0; transform: translateY(20px) scale(0.8); }
          50% { opacity: 0.5; }
          100% { opacity: 0; transform: translateY(-100px) scale(1.2); }
        }

        .afu { animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .afi { animation: fadeIn 1s ease-out both; }
        .afloat { animation: float 6s ease-in-out infinite; }
        .apulse { animation: pulseGlow 2.5s infinite; }
        
        .d1{animation-delay:.1s;} .d2{animation-delay:.2s;} .d3{animation-delay:.3s;} .d4{animation-delay:.4s;}
        
        .glass-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 228, 230, 0.8);
          box-shadow: 0 20px 40px rgba(225, 29, 72, 0.05), inset 0 0 0 1px rgba(255, 255, 255, 0.5);
        }
        
        .inp {
          width: 100%; 
          background: rgba(255, 255, 255, 0.8); 
          border: 2px solid #ffe4e6;
          border-radius: 16px; 
          padding: 14px 18px;
          font-family: 'Plus Jakarta Sans', sans-serif; 
          font-size: 0.95rem;
          color: #4c1d35; 
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
          outline: none;
        }
        .inp:focus { 
          border-color: #fb7185; 
          background: white; 
          box-shadow: 0 4px 20px rgba(251, 113, 133, 0.15); 
          transform: translateY(-1px);
        }
        .inp::placeholder { color: #fda4af; font-weight: 400; }
        .inp:disabled { opacity: 0.5; cursor: not-allowed; }
        textarea.inp { resize: none; line-height: 1.6; }
        
        .btn-romantic {
          background: linear-gradient(135deg, #f43f5e, #e11d48);
          color: white; 
          border: none; 
          cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif; 
          font-weight: 700; 
          font-size: 1.05rem;
          box-shadow: 0 8px 25px rgba(225, 29, 72, 0.3);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
          border-radius: 16px;
          width: 100%; 
          padding: 16px;
          display: flex; 
          align-items: center; 
          justify-content: center; 
          gap: 12px;
        }
        .btn-romantic:hover:not(:disabled) { 
          transform: translateY(-3px) scale(1.01); 
          box-shadow: 0 12px 30px rgba(225, 29, 72, 0.4); 
        }
        .btn-romantic:active:not(:disabled) { transform: translateY(0) scale(0.98); }
        .btn-romantic:disabled { background: linear-gradient(135deg, #e5e7eb, #d1d5db); box-shadow: none; color: #9ca3af; }
        
        .pill { 
          background: rgba(255, 241, 242, 0.8); 
          backdrop-filter: blur(8px);
          border: 1px solid #ffe4e6; 
          color: #e11d48; 
        }
        
        .dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; transition: all 0.3s ease; }
        .dot-on { background: #f43f5e; box-shadow: 0 0 8px rgba(244, 63, 94, 0.5); }
        .dot-off { background: #fce7f3; }
        
        .text-gradient { 
          background: linear-gradient(135deg, #e11d48, #be123c); 
          -webkit-background-clip: text; 
          -webkit-text-fill-color: transparent; 
          background-clip: text; 
        }

        .bg-heart {
          position: absolute;
          color: #ffe4e6;
          z-index: 1;
          opacity: 0;
          animation: floatUpFade 8s linear infinite;
        }
      `}</style>

      {/* Floating Background Hearts Animations */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1, overflow: "hidden" }}>
        <Heart className="bg-heart" fill="currentColor" style={{ left: '10%', top: '80%', width: 40, height: 40, animationDelay: '0s' }} />
        <Heart className="bg-heart" fill="currentColor" style={{ left: '85%', top: '90%', width: 60, height: 60, animationDelay: '2s', animationDuration: '10s' }} />
        <Heart className="bg-heart" fill="currentColor" style={{ left: '50%', top: '70%', width: 30, height: 30, animationDelay: '4s', animationDuration: '7s' }} />
        <Heart className="bg-heart" fill="currentColor" style={{ left: '70%', top: '85%', width: 45, height: 45, animationDelay: '6s' }} />
        <Heart className="bg-heart" fill="currentColor" style={{ left: '20%', top: '95%', width: 50, height: 50, animationDelay: '3s', animationDuration: '9s' }} />
      </div>

      {/* Gradient Presentation Panels */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }} className="romantic-bg">
        <div style={{ position: "absolute", top: '-10%', left: '-10%', width: '50vw', height: '50vw', borderRadius: "50%", opacity: 0.4, filter: "blur(100px)", background: "radial-gradient(circle, #fce7f3, transparent)" }} />
        <div style={{ position: "absolute", bottom: '-10%', right: '-10%', width: '60vw', height: '60vw', borderRadius: "50%", opacity: 0.3, filter: "blur(100px)", background: "radial-gradient(circle, #fda4af, transparent)" }} />
      </div>

      <div style={{ position: "relative", zIndex: 10, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 20px" }}>
        <div style={{ width: "100%", maxWidth: 460, margin: "0 auto" }}>

          {/* Glowing Animated Icon */}
          <div className="afi" style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
            <div className="apulse afloat" style={{ width: 76, height: 76, borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#f43f5e,#be123c)", transform: "rotate(-5deg)" }}>
              <MessageCircleHeart style={{ width: 38, height: 38, color: "white" }} />
            </div>
          </div>

          {/* Text Introductions Header */}
          <div className="afu d1" style={{ textAlign: "center", marginBottom: 40 }}>
            <div className="pill" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 20px", borderRadius: 999, fontSize: 12, fontWeight: 700, marginBottom: 20, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              <Sparkles style={{ width: 14, height: 14 }} /> Couple's Support
            </div>
            <h1 className="font-display" style={{ fontSize: "2.75rem", fontWeight: 700, lineHeight: 1.1, color: "#4c1d35", marginBottom: 16 }}>
              We&apos;re here <br />
              <span className="text-gradient" style={{ fontStyle: "italic", fontWeight: 600 }}>for you both.</span>
            </h1>
            <p style={{ color: "#835e71", fontSize: "1.05rem", lineHeight: 1.6, padding: "0 20px" }}>
              Whether it's a bug or a sweet idea for your shared space, drop us a note. 💌
            </p>
          </div>

          {/* Mount Unified Dynamic Client Form Island */}
          <ContactClient
            sendAction={sendContactMessage}
            maxMessages={MAX_MESSAGES}
            initialRemaining={remaining}
            initialResetIn={params.reset ? Number(params.reset) : resetIn}
            initialErrorType={errorType}
          />

          {/* Footer Note */}
          <div className="afi d4" style={{ marginTop: 28, textAlign: "center" }}>
            <p style={{ fontSize: 12, color: "#9d7b8b", fontWeight: 500 }}>
              🔐 Always private · Just for the two of you
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}