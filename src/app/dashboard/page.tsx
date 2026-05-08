"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

  const [loading, setLoading] =
    useState(true);

  const [username, setUsername] =
    useState("");

  const [partnerInput, setPartnerInput] =
    useState("");

  const [partners, setPartners] =
    useState<Partner[]>([]);

  const [requests, setRequests] =
    useState<Request[]>([]);

  // ====================================
  // 🔐 AUTH
  // ====================================

  useEffect(() => {
    const user =
      localStorage.getItem("username");

    const loginTime =
      localStorage.getItem("loginTime");

    if (!user || !loginTime) {
      router.push("/login");
      return;
    }

    const diff =
      Date.now() - Number(loginTime);

    // 30 min session
    if (diff > 30 * 60 * 1000) {
      localStorage.clear();

      router.push("/login");
      return;
    }

    setUsername(user);

    loadPartners(user);
    loadRequests(user);

    setLoading(false);

  }, [router]);

  // ====================================
  // 📦 LOAD PARTNERS
  // ====================================

  const loadPartners = async (
    user: string
  ) => {
    try {
      const res = await fetch(
        "/api/user/partners",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            username: user,
          }),
        }
      );

      const data =
        await res.json();

      if (data.partners) {
        setPartners(data.partners);
      }

    } catch (err) {
      console.log(err);
    }
  };

  // ====================================
  // 📩 LOAD REQUESTS
  // ====================================

  const loadRequests = async (
    user: string
  ) => {
    try {
      const res = await fetch(
        "/api/request/list",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            username: user,
          }),
        }
      );

      const data =
        await res.json();

      if (data.requests) {
        setRequests(data.requests);
      }

    } catch (err) {
      console.log(err);
    }
  };

  // ====================================
  // ➕ SEND REQUEST
  // ====================================

  const addPartner = async () => {
    try {
      if (!partnerInput) {
        alert("Enter username");
        return;
      }

      if (
        partnerInput.toLowerCase() ===
        username.toLowerCase()
      ) {
        alert(
          "You cannot add yourself"
        );

        return;
      }

      // 🔍 user exists
      const lookupRes = await fetch(
        "/api/user/lookup",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            username: partnerInput,
          }),
        }
      );

      const lookupData =
        await lookupRes.json();

      if (!lookupData.found) {
        alert("User not found");
        return;
      }

      // 📩 send request
      const reqRes = await fetch(
        "/api/request/send",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            from: username,
            to: partnerInput,
          }),
        }
      );

      const reqData =
        await reqRes.json();

      if (!reqRes.ok) {
        alert(
          reqData.error ||
            "Request failed"
        );

        return;
      }

      alert(
        "Partner request sent ✅"
      );

      setPartnerInput("");

    } catch (err) {
      console.log(err);

      alert("Something went wrong");
    }
  };

  // ====================================
  // ✅ ACCEPT REQUEST
  // ====================================

  const acceptRequest = async (
    from: string
  ) => {
    try {
      const res = await fetch(
        "/api/request/accept",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            from,
            to: username,
          }),
        }
      );

      const data =
        await res.json();

      if (!res.ok) {
        alert(
          data.error ||
            "Accept failed"
        );

        return;
      }

      // remove request
      setRequests((prev) =>
        prev.filter(
          (r) => r.from !== from
        )
      );

      // add partner
      setPartners((prev) => [
        ...prev,
        {
          username: from,
          roomId: data.roomId,
        },
      ]);

      // redirect chat
      router.push(
        `/chat/${data.roomId}`
      );

    } catch (err) {
      console.log(err);

      alert("Something went wrong");
    }
  };

  // ====================================
  // ❌ REJECT REQUEST
  // ====================================

  const rejectRequest = async (
    from: string
  ) => {
    try {
      await fetch(
        "/api/request/reject",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            from,
            to: username,
          }),
        }
      );

      setRequests((prev) =>
        prev.filter(
          (r) => r.from !== from
        )
      );

    } catch (err) {
      console.log(err);
    }
  };

  // ====================================
  // 🚪 LOGOUT
  // ====================================

  const logout = () => {
    localStorage.clear();

    router.push("/login");
  };

  // ====================================
  // ⏳ LOADING
  // ====================================

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-xl">
        Loading...
      </div>
    );
  }

  // ====================================
  // UI
  // ====================================

  return (
    <div className="flex h-screen bg-white">

      {/* SIDEBAR */}
      <div className="w-[240px] border-r p-5 flex flex-col">

        <div>
          <h1 className="text-3xl font-bold">
            CChat
          </h1>

          <p className="text-gray-500 mt-1">
            @{username}
          </p>
        </div>

        {/* MENU */}
        <div className="flex flex-col gap-3 mt-10">

          <button
            onClick={() =>
              setTab("partner")
            }
            className={`p-3 rounded text-left transition ${
              tab === "partner"
                ? "bg-black text-white"
                : "border hover:bg-gray-100"
            }`}
          >
            Partners
          </button>

          <button
            onClick={() =>
              setTab("profile")
            }
            className={`p-3 rounded text-left transition ${
              tab === "profile"
                ? "bg-black text-white"
                : "border hover:bg-gray-100"
            }`}
          >
            Profile
          </button>

          <button
            onClick={() =>
              setTab("settings")
            }
            className={`p-3 rounded text-left transition ${
              tab === "settings"
                ? "bg-black text-white"
                : "border hover:bg-gray-100"
            }`}
          >
            Settings
          </button>

        </div>

        {/* LOGOUT */}
        <div className="mt-auto">
          <button
            onClick={logout}
            className="w-full border p-3 rounded hover:bg-red-100"
          >
            Logout
          </button>
        </div>

      </div>

      {/* RIGHT */}
      <div className="flex-1 p-6 overflow-auto">

        {/* ================================= */}
        {/* PARTNERS */}
        {/* ================================= */}

        {tab === "partner" && (
          <div>

            <h2 className="text-3xl font-bold mb-6">
              Partners
            </h2>

            {/* ADD */}
            <div className="flex gap-3 mb-8">

              <input
                value={partnerInput}
                onChange={(e) =>
                  setPartnerInput(
                    e.target.value
                  )
                }
                placeholder="Enter username"
                className="border p-3 rounded w-[320px]"
              />

              <button
                onClick={addPartner}
                className="bg-black text-white px-6 rounded"
              >
                Send Request
              </button>

            </div>

            {/* REQUESTS */}

            <div className="mb-10">

              <h3 className="text-xl font-semibold mb-4">
                Requests
              </h3>

              {requests.length === 0 ? (
                <p className="text-gray-500">
                  No requests
                </p>
              ) : (
                <div className="grid gap-3">

                  {requests.map(
                    (req, index) => (
                      <div
                        key={index}
                        className="border p-4 rounded flex items-center justify-between"
                      >
                        <div>
                          👤 {req.from}
                        </div>

                        <div className="flex gap-2">

                          <button
                            onClick={() =>
                              acceptRequest(
                                req.from
                              )
                            }
                            className="bg-green-500 text-white px-4 py-2 rounded"
                          >
                            Accept
                          </button>

                          <button
                            onClick={() =>
                              rejectRequest(
                                req.from
                              )
                            }
                            className="bg-red-500 text-white px-4 py-2 rounded"
                          >
                            Reject
                          </button>

                        </div>
                      </div>
                    )
                  )}

                </div>
              )}

            </div>

            {/* PARTNERS */}

            <div>

              <h3 className="text-xl font-semibold mb-4">
                Your Partners
              </h3>

              {partners.length === 0 ? (
                <div className="border rounded p-10 text-center text-gray-500">
                  No partners added
                </div>
              ) : (
                <div className="grid gap-3">

                  {partners.map(
                    (partner, index) => (
                      <div
                        key={index}
                        onClick={() =>
                          router.push(
                            `/chat/${partner.roomId}`
                          )
                        }
                        className="border rounded p-4 cursor-pointer hover:bg-gray-100 transition"
                      >
                        <div className="flex items-center justify-between">

                          <div>
                            <h3 className="font-semibold text-lg">
                              👤{" "}
                              {
                                partner.username
                              }
                            </h3>

                            <p className="text-sm text-gray-500">
                              Room:{" "}
                              {
                                partner.roomId
                              }
                            </p>
                          </div>

                          <div className="text-green-500 text-sm">
                            ● Chat
                          </div>

                        </div>
                      </div>
                    )
                  )}

                </div>
              )}

            </div>

          </div>
        )}

        {/* PROFILE */}

        {tab === "profile" && (
          <div>

            <h2 className="text-3xl font-bold mb-5">
              Profile
            </h2>

            <div className="border rounded p-5">
              <p>
                Username:
                <strong>
                  {" "}
                  {username}
                </strong>
              </p>
            </div>

          </div>
        )}

        {/* SETTINGS */}

        {tab === "settings" && (
          <div>

            <h2 className="text-3xl font-bold mb-5">
              Settings
            </h2>

            <div className="border rounded p-5">
              Settings panel
            </div>

          </div>
        )}

      </div>
    </div>
  );
}