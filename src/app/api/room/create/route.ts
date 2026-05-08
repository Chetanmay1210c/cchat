import { db } from "@/lib/db";

function getRoomId(
  user1: string,
  user2: string
) {
  return [user1, user2]
    .sort()
    .join("_");
}

export async function POST(
  req: Request
) {
  try {
    const { user1, user2 } =
      await req.json();

    if (!user1 || !user2) {
      return Response.json(
        {
          error: "Missing users",
        },
        { status: 400 }
      );
    }

    const users =
      db.collection("users");

    // 🔍 check both users exist
    const u1 =
      await users.findOne({
        username: user1,
      });

    const u2 =
      await users.findOne({
        username: user2,
      });

    if (!u1 || !u2) {
      return Response.json(
        {
          error:
            "User not found",
        },
        { status: 404 }
      );
    }

    const roomId = getRoomId(
      user1,
      user2
    );

    const rooms =
      db.collection("rooms");

    // 🔍 existing room
    const existing =
      await rooms.findOne({
        roomId,
      });

    if (!existing) {
      await rooms.insertOne({
        roomId,
        users: [user1, user2],
        createdAt:
          new Date(),
      });
    }

    // 👥 add partner to BOTH users
    await users.updateOne(
      {
        username: user1,
      },
      {
        $addToSet: {
          partners: {
            username: user2,
            roomId,
          },
        },
      }
    );

    await users.updateOne(
      {
        username: user2,
      },
      {
        $addToSet: {
          partners: {
            username: user1,
            roomId,
          },
        },
      }
    );

    return Response.json({
      success: true,
      roomId,
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