export function verifyBridgeRequest(request: Request) {
  const configuredToken = process.env.OPENCLAW_BRIDGE_TOKEN;

  if (!configuredToken) {
    if (process.env.NODE_ENV === "production") {
      return Response.json(
        { error: "OPENCLAW_BRIDGE_TOKEN is required in production." },
        { status: 500 }
      );
    }

    return null;
  }

  const authorization = request.headers.get("authorization");
  const alternateToken = request.headers.get("x-openclaw-bridge-token");
  const bearerToken = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
  const token = bearerToken ?? alternateToken;

  if (token !== configuredToken) {
    return Response.json({ error: "Unauthorized bridge request." }, { status: 401 });
  }

  return null;
}
