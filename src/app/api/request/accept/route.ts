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
    const {
      from,
      to,
    } = await req.json();

    const requests =
      db.collection("requests");

    const users =
      db.collection("users");

    const rooms =
      db.collection("rooms");

    // ✅ accept request
    await requests.updateOne(
      {
        from,
        to,
      },
      {
        $set: {
          status:
            "accepted",
        },
      }
    );

    const roomId =
      getRoomId(from, to);

    // 💾 create room
    await rooms.insertOne({
      roomId,
      users: [from, to],
      createdAt:
        new Date(),
    });

    // 👥 save partners
    await users.updateOne(
      {
        username: from,
      },
      {
        $addToSet: {
          partners: {
            username: to,
            roomId,
          },
        },
      }
    );

    await users.updateOne(
      {
        username: to,
      },
      {
        $addToSet: {
          partners: {
            username: from,
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