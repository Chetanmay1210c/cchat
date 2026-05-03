"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";

const MAX = 3;

export default function ContactClient() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [remaining, setRemaining] = useState(MAX);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formEl = e.currentTarget; // ✅ FIX

    setLoading(true);
    setError("");
    setSuccess("");

    const formData = new FormData(formEl);

    const res = await fetch("/api/contact", {
      method: "POST",
      body: JSON.stringify({
        name: formData.get("name"),
        message: formData.get("message"),
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error);
      if (res.status === 429) setCooldown(600);
      return;
    }

    setSuccess("Sent! 💌");
    setRemaining(data.remaining);

    formEl.reset(); // ✅ SAFE
  }

  const mm = Math.floor(cooldown / 60).toString().padStart(2, "0");
  const ss = (cooldown % 60).toString().padStart(2, "0");

  return (
    <div>
      {cooldown > 0 && (
        <p style={{ marginBottom: 10 }}>
          ⏳ Wait {mm}:{ss}
        </p>
      )}

      {success && (
        <div style={{ color: "#15803d", marginBottom: 10 }}>
          <CheckCircle2 size={16} /> {success}
        </div>
      )}

      {error && (
        <div style={{ color: "#dc2626", marginBottom: 10 }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* 🔥 YOUR SAME FORM */}
      <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:18 }}>

        <input
          name="name"
          maxLength={50}
          placeholder="e.g. Arjun or Priya"
          className="inp"
          required
          disabled={cooldown > 0}
        />

        <textarea
          name="message"
          rows={5}
          placeholder="Tell us what you need help with — we read every message with care 💛"
          className="inp"
          required
          disabled={cooldown > 0}
        />

        <button type="submit" className="btn-rose" disabled={loading || cooldown > 0}>
          {loading ? "Sending..." : "Send Message"}
        </button>

      </form>
    </div>
  );
}