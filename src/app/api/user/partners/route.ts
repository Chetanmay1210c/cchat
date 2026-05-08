import { db } from "@/lib/db";

export async function POST(
  req: Request
) {
  try {
    const { username } =
      await req.json();

    const users =
      db.collection("users");

    const user =
      await users.findOne({
        username,
      });

    if (!user) {
      return Response.json(
        {
          error:
            "User not found",
        },
        { status: 404 }
      );
    }

    return Response.json({
      partners:
        user.partners || [],
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