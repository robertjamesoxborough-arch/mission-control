export const config = { runtime: "nodejs" };

import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST" });
  }

  const { text, vibe } = req.body || {};
  if (!text || !text.trim()) {
    return res.status(400).json({ error: "No text provided" });
  }

  const vibeInstructions = {
    genz: "Use Gen Z slang (no cap, slay, it's giving, lowkey, bussin, fr fr, ate that, main character, understood the assignment, rent free, hits different, era, vibe check, bet, periodt, caught in 4k, mid, rizz, delulu, understood the assignment, W/L, sus, touch grass, based, NPC, core, hyperpop, the ick, understood the assignment)",
    genalpha: "Use Gen Alpha slang (skibidi, sigma, rizz, gyatt, ohio, based, no cap, W rizz, mewing, delulu, fanum tax, alpha, griddy, brain rot, hawk tuah, slay, bomboclaat, aura)",
    mixed: "Mix Gen Z and Gen Alpha slang together for maximum brainrot energy"
  };

  const vibeText = vibeInstructions[vibe] || vibeInstructions.genz;

  const stream = await client.messages.stream({
    model: "claude-opus-4-6",
    max_tokens: 1024,
    system: `You are the ultimate youth slang translator. Your job is to take boring normal sentences and rewrite them in the most current, funny, authentic youth internet slang. ${vibeText}

Rules:
- Keep the same meaning but make it drip with slang
- Add relevant emojis throughout (not too many, just right)
- Make it sound natural, like an actual young person would say it
- Can use abbreviations, acronyms, and internet speak
- Be creative and fun — this should make people laugh and relate
- Don't explain yourself, just give the translated text`,
    messages: [
      {
        role: "user",
        content: `Translate this into youth slang: "${text.trim()}"`
      }
    ],
    thinking: { type: "adaptive" }
  });

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      res.write(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`);
    }
  }

  res.write("data: [DONE]\n\n");
  res.end();
}
