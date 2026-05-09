import { cookies } from "next/headers";

cookies().set(
  "token",
  token,
  {
    httpOnly: true,
    secure:
      process.env.NODE_ENV ===
      "production",

    sameSite: "strict",

    path: "/",

    maxAge: 60 * 5, // 5 minutes
  }
);