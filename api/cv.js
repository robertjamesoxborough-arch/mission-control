export const config = { runtime: "nodejs18.x" };

function must(name, v) {
  if (!v) throw new Error(`Missing: ${name}`);
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Use POST" });
    }

    const { roleTitle, company, jobDescription, profile } = req.body || {};
    must("roleTitle", roleTitle);
    must("company", company);
    must("jobDescription", jobDescription);
    must("profile", profile);

    const apiKey = process.env.OPENAI_API_KEY;
    must("OPENAI_API_KEY env var", apiKey);

    const prompt = `
You are an elite CV writer. Write a UK CV tailored to the role.

OUTPUT FORMAT (strict):
1) HEADLINE (1 line)
2) SUMMARY (3 short bullets)
3) CORE SKILLS (10 bullets)
4) EXPERIENCE (role-by-role bullets, keep punchy, metrics-first)
5) SELECTED ACHIEVEMENTS (5 bullets)
6) EDUCATION (1-2 lines)
7) OPTIONAL: 2-line "Why me" close

TONE:
- confident, specific, human
- no AI vibes
- outcome ownership, judgement, execution in ambiguity
- include measurable impact wherever possible
- avoid fluff

ROLE:
${roleTitle} at ${company}

JOB DESCRIPTION:
${jobDescription}

CANDIDATE PROFILE (truth source):
${profile}
`.trim();

    // Call OpenAI Responses API
    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: prompt,
      }),
    });

    if (!r.ok) {
      const errText = await r.text();
      return res.status(500).json({ error: "OpenAI error", details: errText });
    }

    const data = await r.json();
    const text =
      data.output_text ||
      (Array.isArray(data.output)
        ? data.output.map(o => o?.content?.map(c => c?.text).join("")).join("\n")
        : "");

    return res.status(200).json({ ok: true, cv: text });
  } catch (e) {
    return res.status(400).json({ error: e.message || "Bad request" });
  }
}
