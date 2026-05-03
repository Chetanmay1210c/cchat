import nodemailer from "nodemailer";

const MAX_MESSAGES = 3;
const COOLDOWN_SECONDS = 600;

const ipStore = new Map<string, { count: number; firstSent: number }>();

function getRateLimit(ip: string) {
  const now = Date.now();
  const record = ipStore.get(ip);

  if (!record) return { blocked: false, remaining: MAX_MESSAGES };

  const elapsed = (now - record.firstSent) / 1000;

  if (elapsed > COOLDOWN_SECONDS) {
    ipStore.delete(ip);
    return { blocked: false, remaining: MAX_MESSAGES };
  }

  const remaining = Math.max(0, MAX_MESSAGES - record.count);
  return { blocked: record.count >= MAX_MESSAGES, remaining };
}

export async function POST(req: Request) {
  try {
    const { name, message } = await req.json();

    const cleanName = name?.trim() || "";
    const cleanMessage = message?.trim() || "";

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";

    // ✅ Validation
    if (cleanName.length < 2 || cleanName.length > 50) {
      return Response.json({ error: "Name must be 2–50 chars" }, { status: 400 });
    }

    const words = cleanMessage ? cleanMessage.split(/\s+/).length : 0;

    if (words < 2 || words > 500) {
      return Response.json({ error: "Message must be 2–500 words" }, { status: 400 });
    }

    // ✅ Rate limit
    const { blocked, remaining } = getRateLimit(ip);

    if (blocked) {
      return Response.json(
        { error: "Rate limit hit. Try later." },
        { status: 429 }
      );
    }

    // ✅ Update count
    const existing = ipStore.get(ip);
    if (existing) existing.count += 1;
    else ipStore.set(ip, { count: 1, firstSent: Date.now() });

    // ✅ Send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `Message from ${cleanName}`,
      html: `<p>${cleanMessage}</p>`,
    });

    const updated = ipStore.get(ip)!;
    const newRemaining = Math.max(0, MAX_MESSAGES - updated.count);

    return Response.json({
      success: true,
      remaining: newRemaining,
    });

  } catch {
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}