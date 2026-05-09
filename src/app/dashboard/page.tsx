"use client";

import React, { useEffect, useState, useCallback } from "react";
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

type Partner = {
  username: string;
  roomId: string;
};

type Request = {
  from: string;
};

export default function DashboardPage() {
  const router = useRouter();

  const [tab, setTab] = useState("partner");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [username, setUsername] = useState("");
  const [partnerInput, setPartnerInput] = useState("");
  const [partners, setPartners] = useState<Partner[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);

  // ====================================
  // 📦 LOAD PARTNERS
  // ====================================
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
    } catch (err) {
      console.log(err);
    }
  }, []);

  // ====================================
  // 📩 LOAD REQUESTS
  // ====================================
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
    } catch (err) {
      console.log(err);
    }
  }, []);

  // ====================================
  // 🔄 REFRESH ALL DATA
  // ====================================
  const refreshData = useCallback(async () => {
    if (!username) return;
    setRefreshing(true);
    await Promise.all([loadPartners(username), loadRequests(username)]);
    setRefreshing(false);
  }, [username, loadPartners, loadRequests]);

  // ====================================
  // 🔐 AUTH
  // ====================================
  useEffect(() => {
    let mounted = true;
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
          cache: "no-store",
        });
        if (!res.ok) {
          router.replace("/login");
          return;
        }
        const data = await res.json();
        if (!mounted) return;
        const currentUsername = data.user.username;
        setUsername(currentUsername);
        await Promise.all([
          loadPartners(currentUsername),
          loadRequests(currentUsername),
        ]);
      } catch (err) {
        console.log(err);
        router.replace("/login");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    checkAuth();
    return () => {
      mounted = false;
    };
  }, [router, loadPartners, loadRequests]);

  // ====================================
  // ⚡ REALTIME AUTO REFRESH
  // ====================================
  useEffect(() => {
    if (!username) return;
    const interval = setInterval(() => {
      refreshData();
    }, 3000);
    return () => clearInterval(interval);
  }, [username, refreshData]);

  // ====================================
  // ➕ ADD PARTNER
  // ====================================
  const addPartner = async () => {
    try {
      if (!partnerInput.trim()) {
        alert("Enter username");
        return;
      }
      if (partnerInput.toLowerCase() === username.toLowerCase()) {
        alert("You cannot add yourself");
        return;
      }
      const lookupRes = await fetch("/api/user/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username: partnerInput }),
      });
      const lookupData = await lookupRes.json();

      if (!lookupData.found) {
        alert("User not found");
        return;
      }

      const reqRes = await fetch("/api/request/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ from: username, to: partnerInput }),
      });
      const reqData = await reqRes.json();

      if (!reqRes.ok) {
        alert(reqData.error || "Request failed");
        return;
      }

      setPartnerInput("");
      refreshData();
    } catch (err) {
      console.log(err);
      alert("Something went wrong");
    }
  };

  // ====================================
  // ✅ ACCEPT
  // ====================================
  const acceptRequest = async (from: string) => {
    try {
      const res = await fetch("/api/request/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ from, to: username }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Accept failed");
        return;
      }
      await refreshData();
      router.push(`/chat/${data.roomId}`);
    } catch (err) {
      console.log(err);
      alert("Something went wrong");
    }
  };

  // ====================================
  // ❌ REJECT
  // ====================================
  const rejectRequest = async (from: string) => {
    try {
      await fetch("/api/request/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ from, to: username }),
      });
      refreshData();
    } catch (err) {
      console.log(err);
    }
  };

  // ====================================
  // 🚪 LOGOUT
  // ====================================
  const logout = async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
      window.location.href = "/login";
    } catch (err) {
      console.log(err);
      alert("Logout failed");
    }
  };

  // ====================================
  // ⏳ LOADING
  // ====================================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fffafa]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-rose-500" />
          <p className="text-[#4c1d35] font-semibold">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // ====================================
  // UI
  // ====================================
  return (
    <div className="w-full min-h-screen bg-[#fffafa]">
      <style>{`
        .glass-card {
          background: rgba(255,255,255,0.8);
          backdrop-filter: blur(14px);
          border: 1px solid rgba(255,228,230,0.8);
          box-shadow: 0 10px 30px rgba(225,29,72,0.05);
        }
        .inp {
          width: 100%;
          background: #fff;
          border: 2px solid #ffe4e6;
          border-radius: 16px;
          padding: 12px 16px 12px 42px;
          outline: none;
          transition: 0.3s;
        }
        .inp:focus {
          border-color: #f43f5e;
          box-shadow: 0 0 0 4px rgba(244,63,94,0.08);
        }
        .btn-main {
          background: linear-gradient(135deg, #f43f5e, #e11d48);
          color: white;
          border-radius: 16px;
          font-weight: 600;
          transition: 0.3s;
        }
        .btn-main:hover {
          transform: translateY(-2px);
        }
        /* Mobile Scrollbar hiding for tabs */
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* MAIN CONTAINER: Added pt-24 to push it below the global header */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-24 pb-12">
        
        {/* TOP BAR */}
        <div className="glass-card rounded-3xl p-4 md:p-6 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex-shrink-0">
            <h1 className="text-2xl md:text-3xl font-black text-[#4c1d35] flex items-center gap-2">
              Dashboard <Sparkles className="w-5 h-5 text-rose-500" />
            </h1>
            <p className="text-[#835e71] mt-1 text-sm md:text-base">
              Welcome back @{username}
            </p>
          </div>

          {/* Horizontally scrollable buttons for mobile */}
          <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1 w-full md:w-auto md:pb-0">
            <button
              onClick={() => setTab("partner")}
              className={`flex-shrink-0 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                tab === "partner"
                  ? "bg-rose-500 text-white shadow-md shadow-rose-200"
                  : "bg-white text-[#835e71] border border-rose-50"
              }`}
            >
              Partners
            </button>

            <button
              onClick={() => setTab("profile")}
              className={`flex-shrink-0 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                tab === "profile"
                  ? "bg-rose-500 text-white shadow-md shadow-rose-200"
                  : "bg-white text-[#835e71] border border-rose-50"
              }`}
            >
              Profile
            </button>

            <button
              onClick={() => setTab("settings")}
              className={`flex-shrink-0 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                tab === "settings"
                  ? "bg-rose-500 text-white shadow-md shadow-rose-200"
                  : "bg-white text-[#835e71] border border-rose-50"
              }`}
            >
              Settings
            </button>

            <button
              onClick={refreshData}
              className="flex-shrink-0 px-4 py-2.5 rounded-xl bg-white border border-rose-50 text-[#835e71] font-semibold text-sm flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>

            <button
              onClick={logout}
              className="flex-shrink-0 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 font-semibold text-sm"
            >
              Logout
            </button>
          </div>
        </div>

        {/* PARTNERS TAB */}
        {tab === "partner" && (
          <div className="space-y-6">
            
            {/* ADD PARTNER */}
            <div className="glass-card rounded-3xl p-5 md:p-6">
              <div className="flex items-center gap-2 mb-4 md:mb-5">
                <Sparkles className="w-5 h-5 text-rose-500" />
                <h2 className="text-xl md:text-2xl font-bold text-[#4c1d35]">
                  Add Partner
                </h2>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-300" />
                  <input
                    value={partnerInput}
                    onChange={(e) => setPartnerInput(e.target.value)}
                    placeholder="Enter username..."
                    className="inp"
                  />
                </div>
                <button
                  onClick={addPartner}
                  className="btn-main w-full sm:w-auto px-6 py-3.5 flex items-center justify-center gap-2"
                >
                  Send Request 💌
                </button>
              </div>
            </div>

            {/* GRID FOR REQUESTS & CONNECTIONS */}
            <div className="grid lg:grid-cols-2 gap-6">
              
              {/* REQUESTS */}
              <div className="glass-card rounded-3xl p-5 md:p-6">
                <h3 className="text-xl md:text-2xl font-bold text-[#4c1d35] mb-5">
                  Requests
                </h3>
                {requests.length === 0 ? (
                  <div className="text-center py-8 text-sm text-[#835e71] bg-white/50 rounded-2xl border border-rose-50">
                    No pending requests
                  </div>
                ) : (
                  <div className="space-y-3">
                    {requests.map((req, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-2xl p-3 md:p-4 flex items-center justify-between border border-rose-100 shadow-sm"
                      >
                        <div>
                          <p className="font-bold text-[#4c1d35]">{req.from}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => acceptRequest(req.from)}
                            className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100 transition"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => rejectRequest(req.from)}
                            className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* CONNECTIONS */}
              <div className="glass-card rounded-3xl p-5 md:p-6">
                <h3 className="text-xl md:text-2xl font-bold text-[#4c1d35] mb-5">
                  Connections
                </h3>
                {partners.length === 0 ? (
                  <div className="text-center py-8 text-sm text-[#835e71] bg-white/50 rounded-2xl border border-rose-50">
                    No partners yet
                  </div>
                ) : (
                  <div className="space-y-3">
                    {partners.map((partner, index) => (
                      <div
                        key={index}
                        onClick={() => router.push(`/chat/${partner.roomId}`)}
                        className="bg-white rounded-2xl p-4 border border-rose-100 flex items-center justify-between cursor-pointer hover:border-rose-300 hover:shadow-md transition-all"
                      >
                        <div>
                          <h3 className="font-bold text-[#4c1d35]">
                            {partner.username}
                          </h3>
                          <p className="text-xs md:text-sm text-[#835e71] mt-0.5">
                            Room: {partner.roomId.slice(0, 8)}...
                          </p>
                        </div>
                        <MessageCircleHeart className="w-5 h-5 text-rose-500" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PROFILE TAB */}
        {tab === "profile" && (
          <div className="glass-card rounded-3xl p-6 md:p-8 max-w-xl mx-auto md:mx-0">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-rose-100 to-rose-200 flex items-center justify-center text-3xl md:text-4xl font-black text-rose-600 shadow-inner">
                {username?.charAt(0)?.toUpperCase()}
              </div>
              <div className="mt-2 sm:mt-0">
                <p className="text-sm text-[#835e71] uppercase tracking-wider font-semibold">
                  Username
                </p>
                <h2 className="text-2xl md:text-3xl font-black text-[#4c1d35] mt-1">
                  @{username}
                </h2>
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {tab === "settings" && (
          <div className="glass-card rounded-3xl p-8 max-w-xl mx-auto md:mx-0 text-center">
            <Settings className="w-12 h-12 mx-auto text-rose-300 mb-4 animate-[spin_4s_linear_infinite]" />
            <h2 className="text-xl md:text-2xl font-bold text-[#4c1d35] mb-2">
              Settings
            </h2>
            <p className="text-sm md:text-base text-[#835e71]">
              Settings panel coming soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}