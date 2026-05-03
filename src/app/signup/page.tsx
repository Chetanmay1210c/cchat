"use client";

import { useState } from "react";

export default function SignupPage() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    const res = await fetch("/api/signup", {
      method: "POST",
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setMsg(data.error || "Signup failed");
    } else {
      setMsg("User created ✅");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 w-[300px]"
      >
        <h1 className="text-xl font-bold">Sign Up</h1>

        <input
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          required
          className="border p-2"
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          className="border p-2"
        />

        <input
          name="phone"
          placeholder="Phone"
          value={form.phone}
          onChange={handleChange}
          required
          className="border p-2"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white p-2"
        >
          {loading ? "Creating..." : "Sign Up"}
        </button>

        {msg && <p className="text-sm">{msg}</p>}
      </form>
    </div>
  );
}