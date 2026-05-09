"use client";

import {
  useEffect,
  useState,
  useRef,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import {
  Send,
  MoreVertical,
  Trash2,
  UserMinus,
  ArrowLeft,
 Circle,
} from "lucide-react";

import { ably } from "@/lib/ably";

type Message = {
  text: string;
  sender: string;
  createdAt: string;
};

export default function ChatPage() {
  const params = useParams();

  const router = useRouter();

  const roomId =
    params.roomId as string;

  const [messages, setMessages] =
    useState<Message[]>([]);

  const [input, setInput] =
    useState("");

  const [onlineUsers, setOnlineUsers] =
    useState<string[]>([]);

  const [menuOpen, setMenuOpen] =
    useState(false);

  const messagesEndRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const username =
    typeof window !== "undefined"
      ? localStorage.getItem(
          "username"
        ) || ""
      : "";

  // ====================================
  // 📥 LOAD OLD MESSAGES
  // ====================================

  const loadMessages = async () => {
    try {
      const res = await fetch(
        `/api/chat/messages?roomId=${roomId}`,
        {
          cache: "no-store",
        }
      );

      const data = await res.json();

      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // ====================================
  // 💾 SAVE MESSAGE
  // ====================================

  const saveMessage = async (
    msg: Message
  ) => {
    try {
      await fetch(
        "/api/chat/save",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            roomId,
            message: msg,
          }),
        }
      );
    } catch (err) {
      console.log(err);
    }
  };

  // ====================================
  // 🚀 MAIN EFFECT
  // ====================================

  useEffect(() => {
    if (!roomId || !username)
      return;

    loadMessages();

    const channel =
      ably.channels.get(roomId);

    // =========================
    // 🟢 ONLINE USERS
    // =========================

    channel.presence.enter({
      username,
    });

    const updatePresence =
      async () => {
        const members =
          await channel.presence.get();

        const users =
          members.map(
            (m: any) =>
              m.data.username
          );

        setOnlineUsers(users);
      };

    channel.presence.subscribe(
      updatePresence
    );

    updatePresence();

    // =========================
    // 💬 RECEIVE MESSAGE
    // =========================

    channel.subscribe(
      "message",
      (msg) => {
        setMessages((prev) => [
          ...prev,
          msg.data,
        ]);
      }
    );

    return () => {
      channel.presence.leave();

      channel.unsubscribe();
    };
  }, [roomId, username]);

  // ====================================
  // 📌 AUTO SCROLL
  // ====================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView(
      {
        behavior: "smooth",
      }
    );
  }, [messages]);

  // ====================================
  // 🚀 SEND MESSAGE
  // ====================================

  const sendMessage =
    async () => {
      if (!input.trim()) return;

      const channel =
        ably.channels.get(roomId);

      const msgData: Message = {
        text: input,
        sender: username,
        createdAt:
          new Date().toISOString(),
      };

      // realtime
      await channel.publish(
        "message",
        msgData
      );

      // save database
      await saveMessage(msgData);

      setInput("");
    };

  // ====================================
  // 🗑 DELETE ALL CHATS
  // ====================================

  const deleteChats =
    async () => {
      const ok = confirm(
        "Delete ALL chats for BOTH users?"
      );

      if (!ok) return;

      try {
        // ✅ delete from db
        await fetch(
          "/api/chat/delete",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              roomId,
            }),
          }
        );

        // ✅ clear frontend instantly
        setMessages([]);

        // ✅ close menu
        setMenuOpen(false);

        // ✅ realtime clear for both users
        const channel =
          ably.channels.get(roomId);

        await channel.publish(
          "chat-deleted",
          {
            roomId,
          }
        );

      } catch (err) {
        console.log(err);
      }
    };

  // ====================================
  // ❌ REMOVE PARTNER
  // ====================================

  const removePartner =
    async () => {
      const ok = confirm(
        "Remove partner for BOTH users?"
      );

      if (!ok) return;

      try {
        // ✅ remove relation from DB
        await fetch(
          "/api/partner/remove",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              roomId,
              username,
            }),
          }
        );

        // ✅ delete all chats too
        await fetch(
          "/api/chat/delete",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              roomId,
            }),
          }
        );

        // ✅ realtime event
        const channel =
          ably.channels.get(roomId);

        await channel.publish(
          "partner-removed",
          {
            roomId,
          }
        );

        router.push(
          "/dashboard"
        );

      } catch (err) {
        console.log(err);
      }
    };

  // ====================================
  // 📡 REALTIME EVENTS
  // ====================================

  useEffect(() => {
    if (!roomId) return;

    const channel =
      ably.channels.get(roomId);

    // =========================
    // 🗑 CHAT DELETED
    // =========================

    channel.subscribe(
      "chat-deleted",
      () => {
        setMessages([]);
      }
    );

    // =========================
    // ❌ PARTNER REMOVED
    // =========================

    channel.subscribe(
      "partner-removed",
      () => {
        router.push(
          "/dashboard"
        );
      }
    );

    return () => {
      channel.unsubscribe(
        "chat-deleted"
      );

      channel.unsubscribe(
        "partner-removed"
      );
    };
  }, [roomId, router]);

  // ====================================
  // 👤 ONLINE STATUS
  // ====================================

  const otherUser =
    onlineUsers.find(
      (u) => u !== username
    );

  const isOnline =
    !!otherUser;

  // ====================================
  // UI
  // ====================================

  return (
    <div className="h-screen flex flex-col bg-[#fffafa]">

      <style>{`
        .glass {
          background: rgba(255,255,255,0.82);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255,228,230,0.7);
        }

        .scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .scrollbar::-webkit-scrollbar-thumb {
          background: #fecdd3;
          border-radius: 999px;
        }
      `}</style>

      {/* HEADER */}

      <div className="glass px-4 py-4 border-b border-rose-100 flex items-center justify-between sticky top-0 z-50">

        {/* LEFT */}

        <div className="flex items-center gap-3">

          <button
            onClick={() =>
              router.push(
                "/dashboard"
              )
            }
            className="w-10 h-10 rounded-xl bg-white border border-rose-100 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-[#4c1d35]" />
          </button>

          <div>

            <h1 className="font-black text-[#4c1d35] text-lg">
              Private Chat
            </h1>

            <div className="flex items-center gap-2 text-sm">

              <Circle
                className={`w-3 h-3 ${
                  isOnline
                    ? "fill-green-500 text-green-500"
                    : "fill-gray-300 text-gray-300"
                }`}
              />

              <span className="text-[#835e71]">
                {isOnline
                  ? "Online"
                  : "Offline"}
              </span>

            </div>
          </div>
        </div>

        {/* RIGHT */}

        <div className="relative">

          <button
            onClick={() =>
              setMenuOpen(
                !menuOpen
              )
            }
            className="w-10 h-10 rounded-xl bg-white border border-rose-100 flex items-center justify-center"
          >
            <MoreVertical className="w-5 h-5 text-[#4c1d35]" />
          </button>

          {/* MENU */}

          {menuOpen && (
            <div className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-xl border border-rose-100 overflow-hidden z-50">

              <button
                onClick={
                  deleteChats
                }
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-rose-50 text-left text-red-600"
              >
                <Trash2 className="w-4 h-4" />
                Delete All Chats
              </button>

              <button
                onClick={
                  removePartner
                }
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-rose-50 text-left text-red-600"
              >
                <UserMinus className="w-4 h-4" />
                Remove Partner
              </button>

            </div>
          )}

        </div>
      </div>

      {/* CHAT AREA */}

      <div className="flex-1 overflow-y-auto p-4 scrollbar">

        <div className="max-w-5xl mx-auto flex flex-col gap-3">

          {messages.length === 0 && (
            <div className="text-center mt-20 text-[#835e71]">
              No messages yet 💌
            </div>
          )}

          {messages.map(
            (m, i) => (
              <div
                key={i}
                className={`flex ${
                  m.sender ===
                  username
                    ? "justify-end"
                    : "justify-start"
                }`}
              >

                <div
                  className={`max-w-[80%] md:max-w-[60%] px-4 py-3 rounded-3xl shadow-sm ${
                    m.sender ===
                    username
                      ? "bg-rose-500 text-white rounded-br-md"
                      : "bg-white border border-rose-100 text-[#4c1d35] rounded-bl-md"
                  }`}
                >

                  <div className="text-xs opacity-70 mb-1 font-semibold">
                    {m.sender}
                  </div>

                  <div className="break-words text-[15px] leading-relaxed">
                    {m.text}
                  </div>

                  <div className="text-[10px] opacity-60 mt-2 text-right">
                    {new Date(
                      m.createdAt
                    ).toLocaleTimeString(
                      [],
                      {
                        hour: "2-digit",
                        minute:
                          "2-digit",
                      }
                    )}
                  </div>

                </div>
              </div>
            )
          )}

          <div
            ref={
              messagesEndRef
            }
          />

        </div>
      </div>

      {/* INPUT */}

      <div className="glass border-t border-rose-100 p-4 sticky bottom-0">

        <div className="max-w-5xl mx-auto flex items-center gap-3">

          <input
            value={input}
            onChange={(e) =>
              setInput(
                e.target.value
              )
            }
            onKeyDown={(e) => {
              if (
                e.key ===
                "Enter"
              ) {
                sendMessage();
              }
            }}
            placeholder="Type message..."
            className="flex-1 h-14 px-5 rounded-2xl border border-rose-100 bg-white outline-none focus:border-rose-400"
          />

          <button
            onClick={
              sendMessage
            }
            className="h-14 px-6 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold flex items-center gap-2 transition-all"
          >
            <Send className="w-5 h-5" />
            Send
          </button>

        </div>
      </div>
    </div>
  );
}