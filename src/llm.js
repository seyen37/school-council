// ─── 三家供應商的瀏覽器直連串流轉接層 ──────────────────────
// API key 只存在使用者瀏覽器的 localStorage，直連官方 API，不經任何中介伺服器。

export const PROVIDERS = {
  anthropic: { label: 'Anthropic（Claude）', placeholder: 'sk-ant-…' },
  openai: { label: 'OpenAI（GPT）', placeholder: 'sk-…' },
  gemini: { label: 'Google（Gemini）', placeholder: 'AIza…' },
}

export const DEFAULT_MODELS = {
  anthropic: 'claude-sonnet-4-6',
  openai: 'gpt-4o-mini',
  gemini: 'gemini-2.0-flash',
}

async function* sseEvents(resp) {
  const reader = resp.body.getReader()
  const dec = new TextDecoder()
  let buf = ''
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buf += dec.decode(value, { stream: true })
      const lines = buf.split('\n')
      buf = lines.pop()
      for (const raw of lines) {
        const line = raw.trim()
        if (!line.startsWith('data:')) continue
        const data = line.slice(5).trim()
        if (!data || data === '[DONE]') continue
        try {
          yield JSON.parse(data)
        } catch {
          /* 忽略無法解析的片段 */
        }
      }
    }
  } finally {
    try { reader.releaseLock() } catch { /* noop */ }
  }
}

async function readError(resp) {
  let msg = `HTTP ${resp.status}`
  try {
    const j = await resp.json()
    msg = j?.error?.message || j?.message || JSON.stringify(j).slice(0, 300)
  } catch { /* noop */ }
  return new Error(msg)
}

export async function* streamText({ provider, model, apiKey, system, user, maxTokens = 1000, signal }) {
  if (!apiKey) throw new Error('未設定金鑰：缺少此供應商的 API key，請至「金鑰」設定。')

  if (provider === 'anthropic') {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      signal,
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        stream: true,
        system,
        messages: [{ role: 'user', content: user }],
      }),
    })
    if (!resp.ok) throw await readError(resp)
    for await (const ev of sseEvents(resp)) {
      if (ev.type === 'content_block_delta' && ev.delta?.text) yield ev.delta.text
    }
    return
  }

  if (provider === 'openai') {
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      signal,
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        stream: true,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      }),
    })
    if (!resp.ok) throw await readError(resp)
    for await (const ev of sseEvents(resp)) {
      const t = ev.choices?.[0]?.delta?.content
      if (t) yield t
    }
    return
  }

  if (provider === 'gemini') {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse&key=${encodeURIComponent(apiKey)}`
    const resp = await fetch(url, {
      method: 'POST',
      signal,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: user }] }],
        generationConfig: { maxOutputTokens: maxTokens },
      }),
    })
    if (!resp.ok) throw await readError(resp)
    for await (const ev of sseEvents(resp)) {
      const t = ev.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('')
      if (t) yield t
    }
    return
  }

  throw new Error('未知的供應商：' + provider)
}
