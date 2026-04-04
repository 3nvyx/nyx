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
    const { url, username, password } = await req.json();

    if (!url) {
      return NextResponse.json(
        { error: "Target URL is required" },
        { status: 400 }
      );
    }

    // Build the Discord embed message
    const embed = {
      title: "🔍 NyX — New Scan Request",
      color: 0x00ff41, // green accent
      fields: [
        {
          name: "🎯 Target URL",
          value: `\`${url}\``,
          inline: false,
        },
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: "NyX Bug Bounty Dashboard",
      },
    };

    // Add credentials fields only if provided
    if (username) {
      embed.fields.push({
        name: "👤 Username",
        value: `\`${username}\``,
        inline: true,
      });
    }

    if (password) {
      embed.fields.push({
        name: "🔑 Password",
        value: `\`${password}\``,
        inline: true,
      });
    }

    // Send to Discord webhook
    const discordRes = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "NyX Bot",
        avatar_url: "https://i.imgur.com/placeholder.png",
        content: username
          ? `<@1277872691180998656> @nyx-bot **Scan dispatched** for \`${url}\` with authentication credentials.`
          : `<@1277872691180998656> @nyx-bot **Scan dispatched** for \`${url}\``,
        embeds: [embed],
      }),
    });

    if (!discordRes.ok) {
      const errText = await discordRes.text();
      console.error("Discord webhook error:", errText);
      return NextResponse.json(
        { error: "Failed to dispatch scan" },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, message: "Scan dispatched" });
  } catch (err) {
    console.error("Scan dispatch error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
