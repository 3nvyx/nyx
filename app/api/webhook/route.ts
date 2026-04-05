import { NextRequest, NextResponse } from "next/server";
import globalEvents from "@/app/lib/events";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const { content, embeds } = payload;

    console.log("Received Discord Webhook:", JSON.stringify(payload, null, 2));

    // 1. Check for official NyX Protocol (JSON with event/data)
    if (payload.event && payload.data) {
      globalEvents.emit("nyx-event", JSON.stringify(payload));
      return NextResponse.json({ success: true, source: "protocol" });
    }

    // 2. Check for raw NyX_EVENT string in content (Direct bypass)
    if (content && content.startsWith("NyX_EVENT:")) {
      globalEvents.emit("nyx-event", content.replace("NyX_EVENT:", ""));
      return NextResponse.json({ success: true, source: "direct" });
    }

    // 2. Parse standard Discord message formats
    let eventData: any = null;

    // Look for patterns in content
    if (content) {
      if (content.toLowerCase().includes("finding") || content.toLowerCase().includes("bug")) {
        // Mock finding from text if not in embed
        eventData = {
          event: "finding",
          data: {
            id: `bug-${Date.now()}`,
            severity: content.includes("P1") ? "P1" : "P2",
            name: content.split("finding:")[1]?.trim().split("\n")[0] || "New Finding Discovered",
            timestamp: new Date().toLocaleTimeString(),
            evidenceLine: 1,
          },
        };
      } else if (content.startsWith("$") || content.includes("running")) {
         eventData = {
          event: "console",
          data: { text: content, type: "cmd" }
        };
      } else {
        // Default to a thought or console info
        eventData = {
          event: "thought",
          data: { text: content, timestamp: new Date().toLocaleTimeString() }
        };
      }
    }

    // 3. Parse embeds (more structured)
    if (embeds && embeds.length > 0) {
      const embed = embeds[0];
      const title = embed.title?.toLowerCase() || "";
      const description = embed.description || "";

      if (title.includes("finding") || title.includes("vulnerability")) {
        eventData = {
          event: "finding",
          data: {
            id: `bug-${Date.now()}`,
            severity: title.includes("critical") ? "P1" : "P2",
            name: embed.title,
            timestamp: new Date().toLocaleTimeString(),
            evidenceLine: Math.floor(Math.random() * 10) + 1,
          },
        };
      } else if (title.includes("console") || title.includes("log")) {
        eventData = {
          event: "console",
          data: { text: description, type: "info" }
        };
      }
    }

    if (eventData) {
      globalEvents.emit("nyx-event", JSON.stringify(eventData));
      return NextResponse.json({ success: true, parsed: true });
    }

    return NextResponse.json({ success: false, message: "No recognizable event found" }, { status: 400 });

  } catch (err) {
    console.error("Webhook processing error:", err);
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
