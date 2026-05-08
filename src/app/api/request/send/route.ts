import { db } from "@/lib/db";

export async function POST(
  req: Request
) {
  try {
    const {
      from,
      to,
    } = await req.json();

    if (!from || !to) {
      return Response.json(
        {
          error:
            "Missing fields",
        },
        { status: 400 }
      );
    }

    const users =
      db.collection("users");

    const requests =
      db.collection("requests");

    // 🔍 user exists
    const target =
      await users.findOne({
        username: to,
      });

    if (!target) {
      return Response.json(
        {
          error:
            "User not found",
        },
        { status: 404 }
      );
    }

    // ❌ already requested
    const existing =
      await requests.findOne({
        from,
        to,
        status: "pending",
      });

    if (existing) {
      return Response.json(
        {
          error:
            "Already requested",
        },
        { status: 400 }
      );
    }

    // 💾 create request
    await requests.insertOne({
      from,
      to,
      status: "pending",
      createdAt:
        new Date(),
    });

    return Response.json({
      success: true,
    });

  } catch (err) {
    console.log(err);

    return Response.json(
      {
        error:
          "Server error",
      },
      { status: 500 }
    );
  }
}