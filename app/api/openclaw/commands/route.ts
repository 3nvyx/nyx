import { verifyBridgeRequest } from "@/lib/openclaw/auth";
import { openClawStore } from "@/lib/openclaw/store";
import { dispatchCommandViaTelegram } from "@/lib/openclaw/telegram";
import type { CreateCommandInput } from "@/lib/openclaw/types";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const authError = verifyBridgeRequest(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const runId = searchParams.get("runId") ?? undefined;

  return Response.json({
    commands: openClawStore.getPendingCommands(runId),
  });
}

export async function POST(request: Request) {
  const body = (await request.json()) as CreateCommandInput;

  if (!body?.type) {
    return Response.json({ error: "type is required." }, { status: 400 });
  }

  const command = openClawStore.createCommand({
    runId: body.runId,
    type: body.type,
    payload: body.payload ?? {},
    issuedBy: body.issuedBy ?? "dashboard",
  });

  try {
    const delivery = await dispatchCommandViaTelegram(command);

    return Response.json({
      ok: true,
      command,
      delivery,
      snapshot: openClawStore.getSnapshot(command.runId),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Telegram delivery failed.";
    openClawStore.updateCommandStatus(command.runId, command.id, "failed", message);

    return Response.json(
      {
        ok: false,
        error: message,
        command,
        snapshot: openClawStore.getSnapshot(command.runId),
      },
      { status: 502 }
    );
  }
}
