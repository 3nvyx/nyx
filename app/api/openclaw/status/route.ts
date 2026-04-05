import { openClawStore } from "@/lib/openclaw/store";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const runId = searchParams.get("runId");

  if (!runId) {
    return Response.json({ error: "runId is required." }, { status: 400 });
  }

  return Response.json({
    snapshot: openClawStore.getSnapshot(runId),
  });
}
