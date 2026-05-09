import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export async function GET(
  req: Request
) {
  try {
    const { searchParams } =
      new URL(req.url);

    const roomId =
      searchParams.get("roomId");

    const username =
      searchParams.get("username");

    if (!roomId || !username) {
      return NextResponse.json(
        {
          error: "Missing data",
        },
        { status: 400 }
      );
    }

    const room = await db
      .collection("rooms")
      .findOne({
        roomId,
      });

    if (!room) {
      return NextResponse.json(
        {
          error: "Room not found",
        },
        { status: 404 }
      );
    }

    const partner =
      room.users.find(
        (u: string) =>
          u !== username
      );

    return NextResponse.json({
      partner,
    });
  } catch (err) {
    console.log(err);

    return NextResponse.json(
      {
        error: "Server error",
      },
      { status: 500 }
    );
  }
}