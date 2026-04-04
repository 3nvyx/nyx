import type { OpenClawCommand, TelegramCommandEnvelope } from "@/lib/openclaw/types";

const TELEGRAM_COMMAND_PREFIX = "OPENCLAW_COMMAND";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required to deliver OpenClaw commands through Telegram.`);
  }

  return value;
}

function parseOptionalInteger(value: string | undefined): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed)) {
    throw new Error("TELEGRAM_MESSAGE_THREAD_ID must be an integer if provided.");
  }

  return parsed;
}

function buildEnvelope(command: OpenClawCommand): TelegramCommandEnvelope {
  return {
    version: 1,
    kind: "openclaw_command",
    command: {
      id: command.id,
      runId: command.runId,
      type: command.type,
      payload: command.payload,
      issuedBy: command.issuedBy,
      createdAt: command.createdAt,
    },
  };
}

export function formatTelegramCommand(command: OpenClawCommand): string {
  return `${TELEGRAM_COMMAND_PREFIX} ${JSON.stringify(buildEnvelope(command))}`;
}

export async function dispatchCommandViaTelegram(command: OpenClawCommand) {
  const botToken = requireEnv("TELEGRAM_BOT_TOKEN");
  const chatId = requireEnv("TELEGRAM_CHAT_ID");
  const messageThreadId = parseOptionalInteger(process.env.TELEGRAM_MESSAGE_THREAD_ID);
  const text = formatTelegramCommand(command);

  if (text.length > 4096) {
    throw new Error("OpenClaw command message exceeds Telegram's 4096 character limit.");
  }

  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      ...(messageThreadId ? { message_thread_id: messageThreadId } : {}),
    }),
    cache: "no-store",
  });

  const body = (await response.json()) as {
    ok: boolean;
    description?: string;
    result?: {
      message_id?: number;
      date?: number;
    };
  };

  if (!response.ok || !body.ok) {
    throw new Error(body.description ?? `Telegram command delivery failed with status ${response.status}.`);
  }

  return {
    messageId: body.result?.message_id ?? null,
    sentAt: body.result?.date ?? null,
    chatId,
  };
}
