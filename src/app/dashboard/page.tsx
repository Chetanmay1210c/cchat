"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  UserPlus,
  Check,
  X,
  Settings,
  MessageCircleHeart,
  Sparkles,
  Loader2,
  RefreshCw,
} from "lucide-react";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

type Partner = { username: string; roomId: string };
type Request = { from: string };
type ToastType = "success" | "error" | "info";
type Toast = { id: number; message: string; type: ToastType };

// ─────────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────────

function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}) {
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[999] flex flex-col gap-2 pointer-events-none w-max max-w-[90vw]">
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => onDismiss(t.id)}
          style={{ pointerEvents: "auto", animation: "toastIn 0.3s ease" }}
          className={`
            px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold cursor-pointer text-center
            ${t.type === "success" ? "bg-emerald-500 text-white" : ""}
            ${t.type === "error" ? "bg-red-500 text-white" : ""}
            ${t.type === "info" ? "bg-[#4c1d35] text-white" : ""}
          `}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();

  const [tab, setTab] = useState("partner");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [username, setUsername] = useState("");
  const [partnerInput, setPartnerInput] = useState("");
  const [partners, setPartners] = useState<Partner[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [sendingRequest, setSendingRequest] = useState(false);

  const toastCounter = useRef(0);

  // ── Toast helper ──────────────────────────────
  const addToast = useCallback((message: string, type: ToastType = "info") => {
    const id = ++toastCounter.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const dismissToast = (id: number) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  // ── Load partners ─────────────────────────────
  const loadPartners = useCallback(async (user: string) => {
    try {
      const res = await fetch("/api/user/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({ username: user }),
      });
      const data = await res.json();
      if (data.partners) setPartners(data.partners);
    } catch {}
  }, []);

  // ── Load requests ─────────────────────────────
  const loadRequests = useCallback(async (user: string) => {
    try {
      const res = await fetch("/api/request/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({ username: user }),
      });
      const data = await res.json();
      if (data.requests) setRequests(data.requests);
    } catch {}
  }, []);

  // ── Refresh all ───────────────────────────────
  const refreshData = useCallback(
    async (silent = false) => {
      if (!username) return;
      if (!silent) setRefreshing(true);
      await Promise.all([loadPartners(username), loadRequests(username)]);
      if (!silent) setRefreshing(false);
    },
    [username, loadPartners, loadRequests]
  );

  // ── Auth check on mount ───────────────────────
  useEffect(() => {
    let mounted = true;
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
          cache: "no-store",
        });
        if (!res.ok) { router.replace("/login"); return; }
        const data = await res.json();
        if (!mounted) return;
        const u = data.user.username;
        setUsername(u);
        await Promise.all([loadPartners(u), loadRequests(u)]);
      } catch {
        router.replace("/login");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    checkAuth();
    return () => { mounted = false; };
  }, [router, loadPartners, loadRequests]);

  // ── Auto-refresh every 3s ─────────────────────
  useEffect(() => {
    if (!username) return;
    const interval = setInterval(() => refreshData(true), 3000);
    return () => clearInterval(interval);
  }, [username, refreshData]);

  // ── Send request ──────────────────────────────
  const addPartner = async () => {
    const target = partnerInput.trim();
    if (!target) { addToast("Please enter a username", "error"); return; }
    if (target.toLowerCase() === username.toLowerCase()) {
      addToast("You cannot add yourself", "error");
      return;
    }

    setSendingRequest(true);
    try {
      const lookupRes = await fetch("/api/user/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username: target }),
      });
      const lookupData = await lookupRes.json();
      if (!lookupData.found) { addToast("User not found", "error"); return; }

      const reqRes = await fetch("/api/request/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ from: username, to: target }),
      });
      const reqData = await reqRes.json();

      if (!reqRes.ok) {
        addToast(reqData.error || "Request failed", "error");
        return;
      }

      setPartnerInput("");
      addToast(`Request sent to @${target} 💌`, "success");
      refreshData(true);
    } catch {
      addToast("Something went wrong", "error");
    } finally {
      setSendingRequest(false);
    }
  };

  // ── Accept ────────────────────────────────────
  const acceptRequest = async (from: string) => {
    try {
      const res = await fetch("/api/request/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ from, to: username }),
      });
      const data = await res.json();
      if (!res.ok) { addToast(data.error || "Accept failed", "error"); return; }
      addToast(`Connected with @${from}!`, "success");
      await refreshData(true);
      router.push(`/chat/${data.roomId}`);
    } catch {
      addToast("Something went wrong", "error");
    }
  };

  // ── Reject ────────────────────────────────────
  const rejectRequest = async (from: string) => {
    try {
      await fetch("/api/request/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ from, to: username }),
      });
      addToast(`Request from @${from} declined`, "info");
      refreshData(true);
    } catch {
      addToast("Something went wrong", "error");
    }
  };

  // ── Logout ────────────────────────────────────
  const logout = async () => {
    try {
      await fetch("/api/logout", { method: "POST", credentials: "include" });
      window.location.href = "/login";
    } catch {
      addToast("Logout failed", "error");
    }
  };

  // ─────────────────────────────────────────────
  // LOADING STATE
  // ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fffafa]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-rose-500" />
          <p className="text-[#4c1d35] font-semibold">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <div className="w-full min-h-screen bg-[#fffafa]">
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .glass-card {
          background: rgba(255,255,255,0.80);
          backdrop-filter: blur(14px);
          border: 1px solid rgba(255,228,230,0.8);
          box-shadow: 0 10px 30px rgba(225,29,72,0.05);
        }
        .inp {
          width: 100%;
          background: #fff;
          border: 2px solid #ffe4e6;
          border-radius: 16px;
          padding: 12px 16px 12px 46px;
          outline: none;
          font-size: 15px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .inp:focus {
          border-color: #f43f5e;
          box-shadow: 0 0 0 4px rgba(244,63,94,0.08);
        }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* TOASTS */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-24 pb-12">

        {/* ── TOP BAR ──────────────────────────── */}
        <div className="glass-card rounded-3xl p-4 md:p-6 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-shrink-0">
            <h1 className="text-2xl md:text-3xl font-black text-[#4c1d35] flex items-center gap-2">
              Dashboard <Sparkles className="w-5 h-5 text-rose-500" />
            </h1>
            <p className="text-[#835e71] mt-1 text-sm">Welcome back @{username}</p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1 md:pb-0">
            {(["partner", "profile", "settings"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-shrink-0 px-4 py-2.5 rounded-xl font-semibold text-sm capitalize transition-all ${
                  tab === t
                    ? "bg-rose-500 text-white shadow-md shadow-rose-200"
                    : "bg-white text-[#835e71] border border-rose-100 hover:bg-rose-50"
                }`}
              >
                {t}
              </button>
            ))}

            <button
              onClick={() => refreshData()}
              disabled={refreshing}
              className="flex-shrink-0 px-4 py-2.5 rounded-xl bg-white border border-rose-100 text-[#835e71] font-semibold text-sm flex items-center gap-2 hover:bg-rose-50 transition disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>

            <button
              onClick={logout}
              className="flex-shrink-0 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 font-semibold text-sm hover:bg-red-100 transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* ── PARTNERS TAB ─────────────────────── */}
        {tab === "partner" && (
          <div className="space-y-6">

            {/* Add partner */}
            <div className="glass-card rounded-3xl p-5 md:p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-rose-500" />
                <h2 className="text-xl font-bold text-[#4c1d35]">Add Partner</h2>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-300 pointer-events-none" />
                  <input
                    value={partnerInput}
                    onChange={(e) => setPartnerInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") addPartner(); }}
                    placeholder="Enter username…"
                    className="inp"
                  />
                </div>
                <button
                  onClick={addPartner}
                  disabled={sendingRequest}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 text-white font-bold flex items-center justify-center gap-2 hover:-translate-y-0.5 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {sendingRequest ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Send Request 💌"
                  )}
                </button>
              </div>
            </div>

            {/* Grid */}
            <div className="grid lg:grid-cols-2 gap-6">

              {/* Requests */}
              <div className="glass-card rounded-3xl p-5 md:p-6">
                <h3 className="text-xl font-bold text-[#4c1d35] mb-4">
                  Requests
                  {requests.length > 0 && (
                    <span className="ml-2 text-sm font-semibold bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full">
                      {requests.length}
                    </span>
                  )}
                </h3>

                {requests.length === 0 ? (
                  <div className="text-center py-8 text-sm text-[#835e71] bg-white/60 rounded-2xl border border-rose-50">
                    No pending requests
                  </div>
                ) : (
                  <div className="space-y-3">
                    {requests.map((req, i) => (
                      <div
                        key={i}
                        className="bg-white rounded-2xl p-3 md:p-4 flex items-center justify-between border border-rose-100 shadow-sm"
                      >
                        <div>
                          <p className="font-bold text-[#4c1d35]">@{req.from}</p>
                          <p className="text-xs text-[#835e71]">wants to connect</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => acceptRequest(req.from)}
                            className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100 transition"
                            title="Accept"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => rejectRequest(req.from)}
                            className="w-10 h-10 rounded-xl bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-100 transition"
                            title="Decline"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Connections */}
              <div className="glass-card rounded-3xl p-5 md:p-6">
                <h3 className="text-xl font-bold text-[#4c1d35] mb-4">Connections</h3>

                {partners.length === 0 ? (
                  <div className="text-center py-8 text-sm text-[#835e71] bg-white/60 rounded-2xl border border-rose-50">
                    No partners yet
                  </div>
                ) : (
                  <div className="space-y-3">
                    {partners.map((partner, i) => (
                      <div
                        key={i}
                        onClick={() => router.push(`/chat/${partner.roomId}`)}
                        className="bg-white rounded-2xl p-4 border border-rose-100 flex items-center justify-between cursor-pointer hover:border-rose-300 hover:shadow-md transition-all group"
                      >
                        <div>
                          <h3 className="font-bold text-[#4c1d35] group-hover:text-rose-600 transition-colors">
                            @{partner.username}
                          </h3>
                          <p className="text-xs text-[#835e71] mt-0.5">
                            Room: {partner.roomId.slice(0, 10)}…
                          </p>
                        </div>
                        <MessageCircleHeart className="w-5 h-5 text-rose-400 group-hover:text-rose-600 transition-colors" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── PROFILE TAB ──────────────────────── */}
        {tab === "profile" && (
          <div className="glass-card rounded-3xl p-6 md:p-8 max-w-xl">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-100 to-rose-200 flex items-center justify-center text-4xl font-black text-rose-600 shadow-inner flex-shrink-0">
                {username?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <p className="text-xs text-[#835e71] uppercase tracking-wider font-semibold">Username</p>
                <h2 className="text-2xl md:text-3xl font-black text-[#4c1d35] mt-1">@{username}</h2>
                <p className="text-sm text-[#835e71] mt-2">
                  {partners.length} partner{partners.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── SETTINGS TAB ─────────────────────── */}
        {tab === "settings" && (
          <div className="glass-card rounded-3xl p-8 max-w-xl text-center">
            <Settings className="w-12 h-12 mx-auto text-rose-300 mb-4" style={{ animation: "spin 6s linear infinite" }} />
            <h2 className="text-xl font-bold text-[#4c1d35] mb-2">Settings</h2>
            <p className="text-sm text-[#835e71]">Settings panel coming soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}