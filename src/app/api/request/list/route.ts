import { db } from "@/lib/db";

export async function POST(
  req: Request
) {
  try {
    const { username } =
      await req.json();

    const requests =
      db.collection("requests");

    const data =
      await requests.find(
        {
          to: username,
          status: "pending",
        }
      ).toArray();

    return Response.json({
      requests: data,
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