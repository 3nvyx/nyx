import { NextRequest } from "next/server";
import globalEvents from "@/app/lib/events";

export async function GET(req: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const onEvent = (data: string) => {
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      };

      globalEvents.on("nyx-event", onEvent);

      // Heartbeat to keep connection alive
      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(": heartbeat\n\n"));
      }, 15000);

      req.signal.onabort = () => {
        globalEvents.off("nyx-event", onEvent);
        clearInterval(heartbeat);
        controller.close();
      };
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    },
  });
}
