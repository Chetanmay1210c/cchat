import Ably from "ably";

export async function GET() {
  try {
    const client = new Ably.Rest(
      process.env.ABLY_ROOT_KEY!
    );

    const tokenRequest =
      await client.auth.createTokenRequest({
        clientId:
          "user-" + Date.now(),
      });

    return Response.json(
      tokenRequest
    );

  } catch (err) {
    console.log(err);

    return Response.json(
      { error: "Ably token error" },
      { status: 500 }
    );
  }
}