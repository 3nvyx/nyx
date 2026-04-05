import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) {
      return NextResponse.json({ error: "Discord webhook URL not configured" }, { status: 500 });
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: `**User Message to Openclaw:** ${message}`,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Discord webhook error:", text);
      return NextResponse.json({ error: "Failed to send message to Discord" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing message:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
