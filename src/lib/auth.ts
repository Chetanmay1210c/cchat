import { cookies } from "next/headers";

export function getSession() {
  const cookieStore = cookies();
  const user = cookieStore.get("user")?.value;

  return user ? JSON.parse(user) : null;
}