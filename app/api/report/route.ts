import { NextResponse } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.GROK_API_KEY || "",
  baseURL: "https://api.x.ai/v1",
});

export async function POST(req: Request) {
  try {
    if (!process.env.GROK_API_KEY) {
      return NextResponse.json(
        { error: "Grok API key is missing. Please add GROK_API_KEY to your .env" },
        { status: 500 }
      );
    }

    const { findings, thoughts } = await req.json();

    const systemPrompt = `You are an elite autonomous penetration testing agent named NyX / Openclaw. 
You have just completed a security scan of a target. You will be provided with the findings and thoughts gathered during the scan.
Your task is to generate a professional, highly-detailed, and actionable Penetration Test Executive Summary and Technical Report.
Use clear, easy-to-read Markdown formatting. The tone should be authoritative, clear, and highly technical. Include a brief executive summary, an overview of the findings, and any specific impacts/remediations based on the provided findings.`;

    const userContent = `
Here are the findings from the scan:
${JSON.stringify(findings, null, 2)}

Here are the internal thoughts/logs generated during the scan for context:
${JSON.stringify(thoughts, null, 2)}
    `;

    const completion = await openai.chat.completions.create({
      model: "grok-4.20-0309-reasoning",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
    });

    const reportMarkdown = completion.choices[0]?.message?.content || "Failed to generate report.";
    
    return NextResponse.json({ report: reportMarkdown });
  } catch (error: any) {
    console.error("Grok Report Generation Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate report" },
      { status: 500 }
    );
  }
}
