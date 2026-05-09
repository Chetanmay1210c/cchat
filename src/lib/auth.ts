import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET!;

// =====================
// CREATE TOKEN
// =====================
export function createToken(data: {
  userId: string;
  username: string;
}) {
  return jwt.sign(
    data,
    JWT_SECRET,
    {
      expiresIn: "5m",
    }
  );
}

// =====================
// VERIFY TOKEN (FIX ADDED)
// =====================
export function verifyToken(
  token: string
) {
  try {
    return jwt.verify(
      token,
      JWT_SECRET
    );
  } catch {
    return null;
  }
}