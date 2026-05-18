"use client";

import { useState, useEffect, useRef } from "react";
import { CheckCircle2, AlertCircle, Heart, Timer } from "lucide-react";

interface ContactClientProps {
  sendAction: (formData: FormData) => Promise<{
    success: boolean;
    errorType?: string;
    remaining?: number;
    resetIn?: number;
  }>;
  maxMessages: number;
  initialRemaining: number;
  initialResetIn: number;
  initialErrorType: string | null;
}

export default function ContactClient({
  sendAction,
  maxMessages,
  initialRemaining,
  initialResetIn,
  initialErrorType,
}: ContactClientProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Dynamic limits & tracking state
  const [remaining, setRemaining] = useState(initialRemaining);
  const [cooldown, setCooldown] = useState(initialErrorType === "ratelimit" ? initialResetIn : 0);
  
  const formRef = useRef<HTMLFormElement>(null);

  // Set initial error messages if passed from server deep-links
  useEffect(() => {
    if (initialErrorType === "name") {
      setError("Your sweet name needs to be between 2 and 50 characters.");
    } else if (initialErrorType === "message") {
      setError("Your message should be between 2 and 500 words.");
    } else if (initialErrorType === "ratelimit") {
      setError("Whoa there, lovebirds! You've reached the limit. Please wait for the timer.");
    }
  }, [initialErrorType]);

  // Live countdown timer effect
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => {
      setCooldown((p) => {
        if (p <= 1) {
          setError(null); // Clear rate-limit error message when timer hits 0
          return 0;
        }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (cooldown > 0) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    
    try {
      const result = await sendAction(formData);

      if (!result.success) {
        if (result.errorType === "name") {
          setError("Your sweet name needs to be between 2 and 50 characters.");
        } else if (result.errorType === "message") {
          setError("Your message should be between 2 and 500 words.");
        } else if (result.errorType === "ratelimit") {
          setError("Whoa there, lovebirds! You've reached the limit. Please wait for the timer.");
          setCooldown(result.resetIn ?? 600);
        }
      } else {
        setSuccess(`Message delivered! 🕊️ We'll get back to you soon.`);
        setRemaining(result.remaining ?? 0);
        formRef.current?.reset();
      }
    } catch (err) {
      setError("An unexpected connection error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const blocked = cooldown > 0;
  const msgCount = maxMessages - remaining;

  // Format countdown clock minutes/seconds
  const mm = Math.floor(cooldown / 60).toString().padStart(2, "0");
  const ss = (cooldown % 60).toString().padStart(2, "0");

  return (
    <div style={{ width: "100%" }}>
      {/* Dynamic Love Letters Left Tracker Bar */}
      <div className="afu d2 glass-card" style={{ borderRadius: 20, padding: "16px 24px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#4c1d35", marginBottom: 4 }}>Love Letters Left</p>
          <p style={{ fontSize: 11, color: "#9d7b8b", fontWeight: 500 }}>{maxMessages} max · resets in 10 mins</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {[...Array(maxMessages)].map((_, i) => (
            <span key={i} className={`dot ${i < msgCount ? "dot-on" : "dot-off"}`} />
          ))}
          <span style={{ marginLeft: 8, fontSize: 15, fontWeight: 700, color: "#4c1d35" }}>
            {remaining}<span style={{ color: "#f43f5e", opacity: 0.5, fontWeight: 500 }}>/{maxMessages}</span>
          </span>
        </div>
      </div>

      {/* Live Cooldown Timer Alert banner */}
      {blocked && (
        <div className="afu d2" style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(254, 242, 242, 0.9)", border: "1px solid #fecaca", color: "#dc2626", padding: "16px 20px", borderRadius: 20, marginBottom: 20 }}>
          <Timer style={{ width: 20, height: 20, flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Rate Limit Active</p>
            <p style={{ fontSize: 12, opacity: 0.8, margin: "2px 0 0 0" }}>
              Please wait <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 13 }}>{mm}:{ss}</span> before sending another note.
            </p>
          </div>
        </div>
      )}

      {/* Main Interactive Form Card Container */}
      <div className="afu d3 glass-card" style={{ borderRadius: 28, padding: 32 }}>
        
        {/* Success Feedback Alert Block */}
        {success && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14, background: "rgba(240, 253, 244, 0.8)", border: "1px solid #bbf7d0", color: "#15803d", padding: "18px", borderRadius: 20, marginBottom: 24 }}>
            <CheckCircle2 style={{ width: 24, height: 24, color: "#22c55e", flexShrink: 0 }} />
            <div>
              <p style={{ fontWeight: 700, fontSize: 15, margin: 0 }}>Success!</p>
              <p style={{ fontSize: 13, marginTop: 4, opacity: 0.9, lineHeight: 1.4, margin: 0 }}>{success} You have {remaining} slots left.</p>
            </div>
          </div>
        )}

        {/* Error Feedback Alert Block */}
        {error && (
          <div style={{ display: "flex", alignItems: "center", gap: 14, background: "rgba(254, 242, 242, 0.8)", border: "1px solid #fecaca", color: "#dc2626", padding: "18px", borderRadius: 20, marginBottom: 24 }}>
            <AlertCircle style={{ width: 24, height: 24, flexShrink: 0 }} />
            <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>{error}</p>
          </div>
        )}

        <form ref={formRef} onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Name Field */}
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#4c1d35", marginBottom: 8, marginLeft: 6, letterSpacing: "0.05em" }}>
              Who is writing this? 😉
            </label>
            <input
              name="name"
              maxLength={50}
              placeholder="e.g. Arjun or Priya"
              className="inp"
              required
              disabled={blocked || loading}
              autoComplete="off"
            />
          </div>

          {/* Message Field */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, marginLeft: 6, marginRight: 4 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#4c1d35", letterSpacing: "0.05em" }}>
                What's on your mind? 💌
              </label>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#e11d48", background: "#fff1f2", padding: "4px 10px", borderRadius: 8 }}>
                max 500 words
              </span>
            </div>
            <textarea
              name="message"
              rows={4}
              placeholder="Tell us what you need help with, or share a feature you both would love to see..."
              className="inp"
              required
              disabled={blocked || loading}
            />
          </div>

          {/* Submit Action Button */}
          <button type="submit" className="btn-romantic" disabled={blocked || loading}>
            {loading ? (
              "Sending Love Letter..."
            ) : blocked ? (
              "🔒 Waiting for cooldown..."
            ) : (
              <>
                <Heart style={{ width: 18, height: 18, fill: "white" }} />
                Send with Love
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}