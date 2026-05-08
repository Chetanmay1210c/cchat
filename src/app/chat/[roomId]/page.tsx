"use client";

import {
  useEffect,
  useState,
} from "react";

import { useParams } from "next/navigation";

import { ably } from "@/lib/ably";

export default function ChatPage() {
  const params = useParams();

  const roomId =
    params.roomId as string;

  const [messages, setMessages] =
    useState<any[]>([]);

  const [input, setInput] =
    useState("");

  const [onlineUsers, setOnlineUsers] =
    useState<string[]>([]);

  const username =
    typeof window !== "undefined"
      ? localStorage.getItem(
          "username"
        )
      : null;

  useEffect(() => {
    if (!roomId || !username)
      return;

    // 📡 room channel
    const channel =
      ably.channels.get(roomId);

    // 🟢 presence online
    channel.presence.enter({
      username,
    });

    // 👀 watch online users
    channel.presence.subscribe(
      async () => {
        const members =
          await channel.presence.get();

        setOnlineUsers(
          members.map(
            (m: any) =>
              m.data.username
          )
        );
      }
    );

    // 💬 receive messages
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

  // 🚀 send message
  const sendMessage =
    async () => {
      if (!input.trim()) return;

      const channel =
        ably.channels.get(roomId);

      const msgData = {
        text: input,
        sender: username,
        createdAt:
          new Date(),
      };

      await channel.publish(
        "message",
        msgData
      );

      setInput("");
    };

  return (
    <div className="h-screen flex flex-col">

      {/* HEADER */}
      <div className="border-b p-4 flex justify-between">

        <h1 className="font-bold">
          Room: {roomId}
        </h1>

        <div>
          🟢 Online:{" "}
          {onlineUsers.join(", ")}
        </div>

      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-auto p-4 flex flex-col gap-2">

        {messages.map(
          (m, i) => (
            <div
              key={i}
              className={`max-w-[300px] p-3 rounded ${
                m.sender === username
                  ? "bg-black text-white self-end"
                  : "bg-gray-200 self-start"
              }`}
            >
              <div className="text-xs opacity-70">
                {m.sender}
              </div>

              <div>{m.text}</div>
            </div>
          )
        )}

      </div>

      {/* INPUT */}
      <div className="border-t p-4 flex gap-2">

        <input
          value={input}
          onChange={(e) =>
            setInput(
              e.target.value
            )
          }
          placeholder="Message..."
          className="flex-1 border p-3 rounded"
        />

        <button
          onClick={sendMessage}
          className="bg-black text-white px-5 rounded"
        >
          Send
        </button>

      </div>
    </div>
  );
}