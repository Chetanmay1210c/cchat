"use client";

import {
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Send,
  MoreVertical,
  ArrowLeft,
  Circle,
  Trash2,
  Loader2,
  UserMinus,
  SmilePlus,
  Pencil,
  Check,
  X,
  ChevronDown,
} from "lucide-react";
import { ably } from "@/lib/ably";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

type Reaction = {
  emoji: string;
  users: string[];
};

type Message = {
  id: string;
  text: string;
  sender: string;
  createdAt: string;
  edited?: boolean;
  deleted?: boolean;
  reactions?: Reaction[];
};

type ToastType = "success" | "error" | "info";
type Toast = { id: number; message: string; type: ToastType };

// ─────────────────────────────────────────────
// EMOJI DATA
// ─────────────────────────────────────────────

const QUICK_REACTIONS = ["❤️", "😂", "😮", "😢", "👍", "🔥"];

const EMOJI_CATEGORIES: Record<string, string[]> = {
  "😊 Smileys": ["😀","😃","😄","😁","😆","😅","😂","🤣","😊","😇","🙂","🙃","😉","😌","😍","🥰","😘","😗","😙","😚","😋","😛","😝","😜","🤪","🤨","🧐","🤓","😎","🥸","🤩","🥳"],
  "👋 Gestures": ["👍","👎","👌","🤌","✌️","🤞","🤟","🤘","🤙","👈","👉","👆","👇","☝️","👋","🤚","🖐️","✋","🖖","💪","🦾","🖕","✍️","🤝","🫶","❤️","🧡","💛","💚","💙","💜","🖤","🤍"],
  "🎉 Fun": ["🎉","🎊","🎈","🎁","🎀","🏆","🥇","🌟","⭐","💫","✨","🔥","💥","❄️","🌈","☀️","🌙","⚡","🌊","🎵","🎶","🎸","🎮","🎯","🎲","🃏","🎭","🎨","🖼️","🎬","📸"],
  "🐱 Animals": ["🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯","🦁","🐮","🐷","🐸","🐵","🙈","🙉","🙊","🐔","🐧","🐦","🦆","🦅","🦉","🦇","🐺","🐗","🐴","🦄","🐝","🐛","🦋"],
};

// ─────────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────────

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => onDismiss(t.id)}
          style={{ pointerEvents: "auto", animation: "slideUp 0.3s ease" }}
          className={`
            px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold cursor-pointer whitespace-nowrap
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
// EMOJI PICKER
// ─────────────────────────────────────────────

function EmojiPicker({ onSelect, onClose }: { onSelect: (e: string) => void; onClose: () => void }) {
  const [tab, setTab] = useState(Object.keys(EMOJI_CATEGORIES)[0]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute bottom-14 left-0 w-80 bg-white rounded-3xl shadow-2xl border border-rose-100 z-50 overflow-hidden"
    >
      <div className="flex overflow-x-auto border-b border-rose-100" style={{ scrollbarWidth: "none" }}>
        {Object.keys(EMOJI_CATEGORIES).map((cat) => (
          <button
            key={cat}
            onClick={() => setTab(cat)}
            className={`px-3 py-3 text-lg flex-shrink-0 transition ${tab === cat ? "border-b-2 border-rose-500" : "opacity-50"}`}
          >
            {cat.split(" ")[0]}
          </button>
        ))}
      </div>
      <div className="h-52 overflow-y-auto p-2" style={{ scrollbarWidth: "thin", scrollbarColor: "#fecdd3 transparent" }}>
        <div className="grid grid-cols-8 gap-0.5">
          {EMOJI_CATEGORIES[tab].map((emoji) => (
            <button
              key={emoji}
              onClick={() => { onSelect(emoji); onClose(); }}
              className="h-9 w-9 text-xl rounded-xl hover:bg-rose-50 flex items-center justify-center transition"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// REACTION BAR
// ─────────────────────────────────────────────

function ReactionBar({ onReact, onClose }: { onReact: (emoji: string) => void; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    setTimeout(() => document.addEventListener("mousedown", handler), 0);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute -top-12 left-0 bg-white rounded-full shadow-xl border border-rose-100 flex items-center px-2 py-1 gap-1 z-50"
    >
      {QUICK_REACTIONS.map((e) => (
        <button
          key={e}
          onClick={() => { onReact(e); onClose(); }}
          className="text-xl hover:scale-125 transition-transform w-8 h-8 flex items-center justify-center rounded-full hover:bg-rose-50"
        >
          {e}
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// MESSAGE BUBBLE
// ─────────────────────────────────────────────

function MessageBubble({
  msg,
  isMine,
  username,
  onDelete,
  onEdit,
  onReact,
}: {
  msg: Message;
  isMine: boolean;
  username: string;
  onDelete: () => void;
  onEdit: (newText: string) => void;
  onReact: (emoji: string) => void;
}) {
  const [showReactionBar, setShowReactionBar] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(msg.text);
  const editRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) editRef.current?.focus();
  }, [editing]);

  const submitEdit = () => {
    const trimmed = editText.trim();
    if (!trimmed || trimmed === msg.text) { setEditing(false); return; }
    onEdit(trimmed);
    setEditing(false);
  };

  // Group reactions
  const reactionMap: Record<string, string[]> = {};
  (msg.reactions || []).forEach((r) => {
    if (!reactionMap[r.emoji]) reactionMap[r.emoji] = [];
    reactionMap[r.emoji].push(...r.users);
  });

  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"} group relative`}>
      {/* Hover action buttons */}
      <div
        className={`
          absolute top-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10
          ${isMine ? "right-full mr-2" : "left-full ml-2"}
        `}
      >
        <div className="relative">
          <button
            onClick={() => setShowReactionBar((v) => !v)}
            className="w-7 h-7 rounded-full bg-white border border-rose-100 shadow flex items-center justify-center hover:bg-rose-50 transition"
          >
            <SmilePlus className="w-3.5 h-3.5 text-[#835e71]" />
          </button>
          {showReactionBar && (
            <ReactionBar onReact={onReact} onClose={() => setShowReactionBar(false)} />
          )}
        </div>

        {isMine && !msg.deleted && (
          <button
            onClick={() => setEditing(true)}
            className="w-7 h-7 rounded-full bg-white border border-rose-100 shadow flex items-center justify-center hover:bg-rose-50 transition"
          >
            <Pencil className="w-3.5 h-3.5 text-[#835e71]" />
          </button>
        )}

        {isMine && !msg.deleted && (
          <button
            onClick={onDelete}
            className="w-7 h-7 rounded-full bg-white border border-red-100 shadow flex items-center justify-center hover:bg-red-50 transition"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
          </button>
        )}
      </div>

      <div className="max-w-[80%] md:max-w-[60%] flex flex-col gap-1">
        {/* Bubble */}
        <div
          className={`px-4 py-3 rounded-3xl shadow-sm ${
            isMine
              ? "bg-rose-500 text-white rounded-br-md"
              : "bg-white border border-rose-100 text-[#4c1d35] rounded-bl-md"
          } ${msg.deleted ? "opacity-50" : ""}`}
        >
          <div className={`text-xs mb-1 font-semibold ${isMine ? "opacity-70" : "text-[#835e71]"}`}>
            {msg.sender}
          </div>

          {editing ? (
            <div className="flex items-center gap-2 min-w-[180px]">
              <input
                ref={editRef}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitEdit();
                  if (e.key === "Escape") setEditing(false);
                }}
                className="flex-1 bg-white/20 border-b border-white/60 outline-none text-sm px-1 py-0.5 rounded"
              />
              <button onClick={submitEdit}><Check className="w-4 h-4" /></button>
              <button onClick={() => { setEditing(false); setEditText(msg.text); }}><X className="w-4 h-4" /></button>
            </div>
          ) : (
            <div className={`break-words text-[15px] leading-relaxed ${msg.deleted ? "italic" : ""}`}>
              {msg.deleted ? "This message was deleted" : msg.text}
            </div>
          )}

          <div className={`text-[10px] mt-2 text-right flex items-center justify-end gap-1 ${isMine ? "opacity-60" : "opacity-50"}`}>
            {msg.edited && !msg.deleted && <span className="italic">edited</span>}
            <span>
              {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </div>

        {/* Reactions */}
        {Object.keys(reactionMap).length > 0 && (
          <div className={`flex flex-wrap gap-1 ${isMine ? "justify-end" : "justify-start"}`}>
            {Object.entries(reactionMap).map(([emoji, users]) => {
              const reacted = users.includes(username);
              return (
                <button
                  key={emoji}
                  onClick={() => onReact(emoji)}
                  title={users.join(", ")}
                  className={`text-xs px-2 py-0.5 rounded-full border flex items-center gap-1 transition
                    ${reacted
                      ? "bg-rose-100 border-rose-300 text-rose-700"
                      : "bg-white border-rose-100 text-[#4c1d35] hover:bg-rose-50"
                    }`}
                >
                  <span>{emoji}</span>
                  <span className="font-semibold">{users.length}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// CONFIRM DIALOG
// ─────────────────────────────────────────────

function ConfirmDialog({
  title,
  description,
  confirmLabel,
  danger,
  onConfirm,
  onCancel,
  loading,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[998] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-3xl shadow-2xl border border-rose-100 p-6 max-w-sm w-full z-10">
        <h2 className="font-black text-[#4c1d35] text-lg mb-2">{title}</h2>
        <p className="text-[#835e71] text-sm mb-6">{description}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 h-11 rounded-2xl border border-rose-100 text-[#835e71] font-semibold hover:bg-rose-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 h-11 rounded-2xl font-bold flex items-center justify-center gap-2 transition disabled:opacity-50
              ${danger ? "bg-red-500 hover:bg-red-600 text-white" : "bg-rose-500 hover:bg-rose-600 text-white"}`}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [sendingMsg, setSendingMsg] = useState(false);
  const [confirmDeleteChat, setConfirmDeleteChat] = useState(false);
  const [confirmRemovePartner, setConfirmRemovePartner] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const toastCounter = useRef(0);

  const username =
    typeof window !== "undefined" ? localStorage.getItem("username") || "" : "";

  // ── TOAST ─────────────────────────────────────
  const addToast = useCallback((message: string, type: ToastType = "info") => {
    const id = ++toastCounter.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3200);
  }, []);

  const dismissToast = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  // ── LOAD MESSAGES ─────────────────────────────
  const loadMessages = async () => {
    try {
      const res = await fetch(`/api/chat/messages?roomId=${roomId}`, { cache: "no-store" });
      const data = await res.json();
      if (data.messages) setMessages(data.messages);
    } catch {
      addToast("Failed to load messages", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── SAVE MESSAGE ──────────────────────────────
  const saveMessage = async (msg: Message) => {
    try {
      await fetch("/api/chat/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, message: msg }),
      });
    } catch {}
  };

  // ── ABLY EFFECT ───────────────────────────────
  useEffect(() => {
    if (!roomId || !username) return;

    loadMessages();

    const channel = ably.channels.get(roomId);
    channel.presence.enter({ username });

    const updatePresence = async () => {
      const members = await channel.presence.get();
      setOnlineUsers(members.map((m: any) => m.data.username));
    };
    channel.presence.subscribe(updatePresence);
    updatePresence();

    // Incoming new message
    channel.subscribe("message", (msg) => {
      setMessages((prev) => {
        if (prev.find((m) => m.id === msg.data.id)) return prev;
        return [...prev, msg.data];
      });
    });

    // Edited
    channel.subscribe("message-edited", (msg) => {
      const { id, text } = msg.data;
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, text, edited: true } : m))
      );
    });

    // Deleted
    channel.subscribe("message-deleted", (msg) => {
      const { id } = msg.data;
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, deleted: true } : m))
      );
    });

    // Reaction
    channel.subscribe("reaction-updated", (msg) => {
      const { id, reactions } = msg.data;
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, reactions } : m))
      );
    });

    // Chat cleared
    channel.subscribe("chat-cleared", () => {
      setMessages([]);
      addToast("Chat cleared by the other user", "info");
    });

    // Partner removed — redirect
    channel.subscribe("partner-removed", () => {
      router.push("/dashboard");
    });

    return () => {
      channel.presence.leave();
      channel.unsubscribe();
    };
  }, [roomId, username]);

  // ── SCROLL BUTTON ─────────────────────────────
  useEffect(() => {
    const el = chatAreaRef.current;
    if (!el) return;
    const onScroll = () =>
      setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 200);
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // ── AUTO-SCROLL ───────────────────────────────
  useEffect(() => {
    if (!showScrollBtn) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // ── CLOSE MENU OUTSIDE ────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── SEND ──────────────────────────────────────
  const sendMessage = async () => {
    if (!input.trim() || sendingMsg) return;
    setSendingMsg(true);

    const channel = ably.channels.get(roomId);
    const msgData: Message = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      text: input.trim(),
      sender: username,
      createdAt: new Date().toISOString(),
      reactions: [],
    };

    try {
      await channel.publish("message", msgData);
      await saveMessage(msgData);
      setInput("");
    } catch {
      addToast("Failed to send message", "error");
    } finally {
      setSendingMsg(false);
    }
  };

  // ── EDIT ──────────────────────────────────────
  const editMessage = async (msgId: string, newText: string) => {
    const channel = ably.channels.get(roomId);
    try {
      await channel.publish("message-edited", { id: msgId, text: newText });
      await fetch("/api/chat/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, msgId, text: newText }),
      });
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, text: newText, edited: true } : m))
      );
    } catch {
      addToast("Failed to edit message", "error");
    }
  };

  // ── DELETE MESSAGE ────────────────────────────
  const deleteMessage = async (msgId: string) => {
    const channel = ably.channels.get(roomId);
    try {
      await channel.publish("message-deleted", { id: msgId });
      await fetch("/api/chat/delete-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, msgId }),
      });
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, deleted: true } : m))
      );
    } catch {
      addToast("Failed to delete message", "error");
    }
  };

  // ── REACT ─────────────────────────────────────
  const reactToMessage = async (msgId: string, emoji: string) => {
    const msg = messages.find((m) => m.id === msgId);
    if (!msg) return;

    const reactions = JSON.parse(JSON.stringify(msg.reactions || [])) as Reaction[];
    const existing = reactions.find((r) => r.emoji === emoji);

    if (existing) {
      if (existing.users.includes(username)) {
        existing.users = existing.users.filter((u) => u !== username);
        if (existing.users.length === 0) reactions.splice(reactions.indexOf(existing), 1);
      } else {
        existing.users.push(username);
      }
    } else {
      reactions.push({ emoji, users: [username] });
    }

    const channel = ably.channels.get(roomId);
    try {
      await channel.publish("reaction-updated", { id: msgId, reactions });
      await fetch("/api/chat/react", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, msgId, reactions }),
      });
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, reactions } : m))
      );
    } catch {
      addToast("Failed to update reaction", "error");
    }
  };

  // ── DELETE CHAT (messages only) ───────────────
  const deleteChatMessages = async () => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/chat/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId }),
      });
      if (!res.ok) { addToast("Failed to clear chat", "error"); return; }

      const channel = ably.channels.get(roomId);
      await channel.publish("chat-cleared", {});
      setMessages([]);
      setConfirmDeleteChat(false);
      setMenuOpen(false);
      addToast("Chat cleared for everyone", "success");
    } catch {
      addToast("Something went wrong", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // ── REMOVE PARTNER ────────────────────────────
  const removePartner = async () => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/chat/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ roomId }),
      });
      if (!res.ok) { addToast("Delete failed", "error"); return; }

      const channel = ably.channels.get(roomId);
      await channel.publish("partner-removed", { roomId });
      setConfirmRemovePartner(false);
      setMenuOpen(false);
      router.push("/dashboard");
    } catch {
      addToast("Something went wrong", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // ── DERIVED ───────────────────────────────────
  const otherUser = onlineUsers.find((u) => u !== username) || "";
  const isOnline = !!otherUser;

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <div className="h-screen flex flex-col bg-[#fffafa] relative">
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .glass {
          background: rgba(255,255,255,0.88);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,228,230,0.7);
        }
        .scrollbar::-webkit-scrollbar { width: 5px; }
        .scrollbar::-webkit-scrollbar-thumb { background: #fecdd3; border-radius: 999px; }
      `}</style>

      {/* TOASTS */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* CONFIRM: Clear chat */}
      {confirmDeleteChat && (
        <ConfirmDialog
          title="Clear Chat?"
          description="This will permanently delete all messages for both users. This cannot be undone."
          confirmLabel="Clear Chat"
          danger
          loading={actionLoading}
          onConfirm={deleteChatMessages}
          onCancel={() => setConfirmDeleteChat(false)}
        />
      )}

      {/* CONFIRM: Remove partner */}
      {confirmRemovePartner && (
        <ConfirmDialog
          title="Remove Partner?"
          description="This will delete the room and all messages, remove you as partners, and redirect both users to the dashboard."
          confirmLabel="Remove Partner"
          danger
          loading={actionLoading}
          onConfirm={removePartner}
          onCancel={() => setConfirmRemovePartner(false)}
        />
      )}

      {/* ── HEADER ─────────────────────────────── */}
      <div className="glass px-4 py-3 border-b border-rose-100 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="w-10 h-10 rounded-xl bg-white border border-rose-100 flex items-center justify-center hover:bg-rose-50 transition"
          >
            <ArrowLeft className="w-5 h-5 text-[#4c1d35]" />
          </button>
          <div>
            <h1 className="font-black text-[#4c1d35] text-lg leading-tight">Private Chat</h1>
            <div className="flex items-center gap-1.5 text-sm">
              <Circle
                className={`w-2.5 h-2.5 ${isOnline ? "fill-green-500 text-green-500" : "fill-gray-300 text-gray-300"}`}
              />
              <span className="text-[#835e71] text-xs">
                {isOnline ? `${otherUser} is online` : "Partner offline — messages will be saved"}
              </span>
            </div>
          </div>
        </div>

        {/* Three-dot menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="w-10 h-10 rounded-xl bg-white border border-rose-100 flex items-center justify-center hover:bg-rose-50 transition"
          >
            <MoreVertical className="w-5 h-5 text-[#4c1d35]" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-12 w-64 bg-white rounded-2xl shadow-2xl border border-rose-100 overflow-hidden z-50">
              {/* Delete chat messages only */}
              <button
                onClick={() => { setConfirmDeleteChat(true); setMenuOpen(false); }}
                className="w-full px-4 py-3.5 flex items-center gap-3 text-left hover:bg-rose-50 transition"
              >
                <Trash2 className="w-5 h-5 text-rose-400 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-sm text-[#4c1d35]">Delete All Chats</div>
                  <div className="text-xs text-[#835e71]">Clear messages for both users</div>
                </div>
              </button>

              <div className="h-px bg-rose-50 mx-3" />

              {/* Remove partner + redirect */}
              <button
                onClick={() => { setConfirmRemovePartner(true); setMenuOpen(false); }}
                className="w-full px-4 py-3.5 flex items-center gap-3 text-left hover:bg-red-50 transition"
              >
                <UserMinus className="w-5 h-5 text-red-500 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-sm text-red-600">Remove Partner</div>
                  <div className="text-xs text-red-400">Delete room &amp; redirect both users</div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── CHAT AREA ──────────────────────────── */}
      <div ref={chatAreaRef} className="flex-1 overflow-y-auto p-4 scrollbar">
        <div className="max-w-3xl mx-auto flex flex-col gap-4">
          {loading && (
            <div className="flex items-center justify-center mt-20 gap-2 text-[#835e71]">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading messages…</span>
            </div>
          )}

          {!loading && messages.length === 0 && (
            <div className="text-center mt-20">
              <div className="text-5xl mb-4">💌</div>
              <p className="text-[#835e71] font-medium">No messages yet</p>
              <p className="text-[#c4a0b4] text-sm mt-1">Say something nice!</p>
            </div>
          )}

          {messages.map((m) => (
            <MessageBubble
              key={m.id}
              msg={m}
              isMine={m.sender === username}
              username={username}
              onDelete={() => deleteMessage(m.id)}
              onEdit={(text) => editMessage(m.id, text)}
              onReact={(emoji) => reactToMessage(m.id, emoji)}
            />
          ))}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Scroll to bottom button */}
      {showScrollBtn && (
        <button
          onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })}
          className="fixed bottom-24 right-5 w-10 h-10 bg-rose-500 text-white rounded-full shadow-lg flex items-center justify-center z-40 hover:bg-rose-600 transition"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      )}

      {/* ── INPUT BAR ──────────────────────────── */}
      <div className="glass border-t border-rose-100 p-3 sticky bottom-0">
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          {/* Emoji picker */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setEmojiPickerOpen((v) => !v)}
              className="w-11 h-11 rounded-2xl border border-rose-100 bg-white flex items-center justify-center hover:bg-rose-50 transition text-xl"
              title="Emoji"
            >
              😊
            </button>
            {emojiPickerOpen && (
              <EmojiPicker
                onSelect={(e) => setInput((v) => v + e)}
                onClose={() => setEmojiPickerOpen(false)}
              />
            )}
          </div>

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
            }}
            placeholder="Type a message…"
            className="flex-1 h-11 px-4 rounded-2xl border border-rose-100 bg-white outline-none focus:border-rose-400 text-[15px] transition"
          />

          <button
            onClick={sendMessage}
            disabled={!input.trim() || sendingMsg}
            className="h-11 px-5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold flex items-center gap-2 transition disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            {sendingMsg ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      </div>
    </div>
  );
}