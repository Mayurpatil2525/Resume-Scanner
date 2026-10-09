// ─── Groq API ────────────────────────────────────────────────────────────────
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL    = 'llama-3.3-70b-versatile'   // fast + smart, free tier available

export async function analyzeResume(jobDesc, resumeText) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY
  if (!apiKey) throw new Error('VITE_GROQ_API_KEY not set in .env file')

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.3,
      max_tokens: 1000,
      messages: [
        {
          role: 'system',
          content: 'You are a senior technical recruiter. Always respond with valid JSON only. No markdown, no explanation, no extra text.',
        },
        {
          role: 'user',
          content: `Analyze this resume against the job description and return ONLY this JSON:

{"score":0-100,"grade":"A+|A|A-|B+|B|B-|C+|C|D|F","summary":"2-sentence candidate summary","strengths":["s1","s2","s3"],"gaps":["g1","g2"],"skills":["sk1","sk2","sk3","sk4"],"recommendation":"Highly Recommended|Recommended|Consider|Pass","experience_match":"Strong|Moderate|Weak","education_match":"Strong|Moderate|Weak|N/A"}

JOB DESCRIPTION:
${jobDesc}

RESUME:
${resumeText}`,
        },
      ],
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `Groq API error: ${res.status}`)
  }

  const data = await res.json()
  const text = data.choices?.[0]?.message?.content || '{}'
  return JSON.parse(text.replace(/```json|```/g, '').trim())
}
