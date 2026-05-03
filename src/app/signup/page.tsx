"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, User, KeyRound, Smartphone, Calendar, Sparkles, Loader2 } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    username: "",
    password: "",
    phone: "",
    dob: "",
    gender: "",
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [isError, setIsError] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    setIsError(false);

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg(data.error || "Oops! Something went wrong.");
        setIsError(true);
      } else {
        setMsg("Space created! 💌 Redirecting to login...");
        setIsError(false);

        setTimeout(() => {
          router.push("/login");
        }, 1500);
      }
    } catch (err) {
      setMsg("Connection lost. Try again? 🥺");
      setIsError(true);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#fffbfb] flex items-center justify-center px-5 py-12 relative overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        
        .font-display { font-family: 'Playfair Display', serif; }
        .font-sans { font-family: 'Plus Jakarta Sans', sans-serif; }

        @keyframes float { 
          0%, 100% { transform: translateY(0) rotate(-3deg); } 
          50% { transform: translateY(-15px) rotate(3deg); } 
        }
        @keyframes floatUpFade {
          0% { opacity: 0; transform: translateY(20px) scale(0.8); }
          50% { opacity: 0.4; }
          100% { opacity: 0; transform: translateY(-100px) scale(1.2); }
        }
        @keyframes fadeUp { 
          from { opacity: 0; transform: translateY(20px); } 
          to { opacity: 1; transform: translateY(0); } 
        }

        .afloat { animation: float 6s ease-in-out infinite; }
        .afu { animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        
        .bg-heart {
          position: absolute;
          color: #ffe4e6;
          z-index: 1;
          opacity: 0;
          animation: floatUpFade 8s linear infinite;
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 228, 230, 0.8);
          box-shadow: 0 24px 50px rgba(225, 29, 72, 0.06), inset 0 0 0 1px rgba(255, 255, 255, 0.6);
        }

        .input-group {
          position: relative;
        }
        
        .inp {
          width: 100%; 
          background: #fafaf8; 
          border: 2px solid #ffe4e6;
          border-radius: 16px; 
          padding: 16px 16px 16px 48px;
          font-family: 'Plus Jakarta Sans', sans-serif; 
          font-size: 0.95rem;
          color: #4c1d35; 
          transition: all 0.3s ease; 
          outline: none;
        }
        
        .inp:focus { 
          border-color: #fb7185; 
          background: white; 
          box-shadow: 0 4px 20px rgba(251, 113, 133, 0.12); 
          transform: translateY(-2px);
        }
        
        .inp::placeholder { color: #fda4af; font-weight: 500; }
        .inp:disabled { opacity: 0.6; cursor: not-allowed; }

        .input-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #fb7185;
          transition: color 0.3s ease;
          pointer-events: none;
        }
        
        .inp:focus + .input-icon, .inp:focus ~ .input-icon {
          color: #e11d48;
        }

        select.inp {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23fb7185' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 16px center;
        }

        .btn-romantic {
          background: linear-gradient(135deg, #f43f5e, #e11d48);
          color: white; 
          border: none; 
          cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif; 
          font-weight: 700; 
          font-size: 1.05rem;
          box-shadow: 0 8px 25px rgba(225, 29, 72, 0.3);
          transition: all 0.3s ease; 
          border-radius: 16px;
          width: 100%; 
          padding: 18px;
          display: flex; 
          align-items: center; 
          justify-content: center; 
          gap: 10px;
        }
        
        .btn-romantic:hover:not(:disabled) { 
          transform: translateY(-3px); 
          box-shadow: 0 12px 30px rgba(225, 29, 72, 0.4); 
        }
        .btn-romantic:active:not(:disabled) { transform: translateY(0); }
        .btn-romantic:disabled { background: linear-gradient(135deg, #fecdd3, #fda4af); box-shadow: none; cursor: not-allowed; }

        .text-gradient { 
          background: linear-gradient(135deg, #e11d48, #be123c); 
          -webkit-background-clip: text; 
          -webkit-text-fill-color: transparent; 
          background-clip: text; 
        }
      `}</style>

      {/* Floating Background Elements */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-30 blur-[100px] bg-[radial-gradient(circle,#fce7f3,transparent)]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full opacity-30 blur-[100px] bg-[radial-gradient(circle,#fda4af,transparent)]" />
        
        <Heart className="bg-heart" fill="currentColor" style={{ left: '15%', top: '80%', width: 40, height: 40, animationDelay: '0s' }} />
        <Heart className="bg-heart" fill="currentColor" style={{ left: '85%', top: '90%', width: 60, height: 60, animationDelay: '2s', animationDuration: '10s' }} />
        <Heart className="bg-heart" fill="currentColor" style={{ left: '75%', top: '20%', width: 35, height: 35, animationDelay: '5s', animationDuration: '8s' }} />
      </div>

      <div className="w-full max-w-[420px] relative z-10 font-sans afu opacity-0">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#f43f5e] to-[#be123c] shadow-lg shadow-rose-500/30 mb-6 afloat">
            <Heart className="w-8 h-8 text-white" fill="currentColor" />
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Welcome to CChat
          </div>
          <h1 className="font-display text-3xl font-bold text-[#4c1d35] leading-tight mb-2">
            Build your <span className="text-gradient italic">private home</span>
          </h1>
          <p className="text-[#835e71] text-sm">
            Just a few details to create a cozy space for your love. 💌
          </p>
        </div>

        {/* The Glass Form Card */}
        <form onSubmit={handleSubmit} className="glass-card rounded-[32px] p-6 sm:p-8 flex flex-col gap-5">
          
          {/* Username Input */}
          <div>
            <label className="block text-xs font-bold text-[#4c1d35] mb-2 ml-2 tracking-wide">
              What does your partner call you? 😉
            </label>
            <div className="input-group">
              <User className="input-icon w-5 h-5" />
              <input
                name="username"
                placeholder="e.g. Baby, Hubby, Wifey..."
                value={form.username}
                onChange={handleChange}
                required
                disabled={loading}
                className="inp"
                autoComplete="off"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-bold text-[#4c1d35] mb-2 ml-2 tracking-wide">
              A secret key just for you 🤫
            </label>
            <div className="input-group">
              <KeyRound className="input-icon w-5 h-5" />
              <input
                name="password"
                type="password"
                placeholder="Make it unguessable..."
                value={form.password}
                onChange={handleChange}
                required
                disabled={loading}
                className="inp"
              />
            </div>
          </div>

          {/* Phone Input */}
          <div>
            <label className="block text-xs font-bold text-[#4c1d35] mb-2 ml-2 tracking-wide">
              Your number (for invites ✨)
            </label>
            <div className="input-group">
              <Smartphone className="input-icon w-5 h-5" />
              <input
                name="phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={form.phone}
                onChange={handleChange}
                required
                disabled={loading}
                className="inp"
                autoComplete="tel"
              />
            </div>
          </div>

          {/* DOB & Gender Row (Grid) */}
          <div className="grid grid-cols-2 gap-4">
            {/* DOB */}
            <div>
              <label className="block text-xs font-bold text-[#4c1d35] mb-2 ml-2 tracking-wide">
                Special Day 🎂
              </label>
              <div className="input-group">
                <Calendar className="input-icon w-4 h-4" />
                <input
                  name="dob"
                  type="date"
                  value={form.dob}
                  onChange={handleChange}
                  disabled={loading}
                  className="inp text-sm !pl-10"
                />
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-bold text-[#4c1d35] mb-2 ml-2 tracking-wide">
                I am a... ✨
              </label>
              <div className="input-group">
                <Sparkles className="input-icon w-4 h-4" />
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  disabled={loading}
                  className="inp text-sm !pl-10 cursor-pointer"
                >
                  <option value="" disabled>Select</option>
                  <option value="male">Boy</option>
                  <option value="female">Girl</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-romantic mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Preparing your space...
              </>
            ) : (
              "Create our space 💖"
            )}
          </button>

          {/* Message Display */}
          {msg && (
            <div className={`mt-2 p-4 rounded-2xl text-sm font-semibold text-center border ${
              isError 
                ? "bg-red-50 border-red-200 text-red-600" 
                : "bg-emerald-50 border-emerald-200 text-emerald-600"
            }`}>
              {msg}
            </div>
          )}
        </form>

        {/* Footer Link */}
        <div className="mt-8 text-center">
          <p className="text-[#835e71] text-sm">
            Already built your home?{" "}
            <Link href="/login" className="font-bold text-[#e11d48] hover:text-[#be123c] transition-colors underline decoration-2 decoration-rose-200 underline-offset-4">
              Log in here.
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}