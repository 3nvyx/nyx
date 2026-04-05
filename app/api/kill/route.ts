import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    return NextResponse.json(
      { error: "Discord webhook not configured" },
      { status: 500 }
    );
  }

  try {
    const { url } = await req.json();

    // Build the Discord kill message
    const embed = {
      title: "🛑 NyX — Scan Terminated",
      description: url ? `Scan for \`${url}\` has been manually aborted by the operator.` : "Active scan has been manually aborted.",
      color: 0xff4141, // red accent
      timestamp: new Date().toISOString(),
      footer: {
        text: "NyX Bug Bounty Dashboard",
      },
    };

    // Send to Discord webhook
    const discordRes = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "NyX Bot",
        content: `**<@1490086576191963278> ABORT CURRENT SCAN.**`,
        embeds: [embed],
      }),
    });

    if (!discordRes.ok) {
      return NextResponse.json(
        { error: "Failed to dispatch kill signal" },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, message: "Kill signal sent" });
  } catch (err) {
    console.error("Kill dispatch error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
