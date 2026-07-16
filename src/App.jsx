import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  COUNCILS, getCouncil, getMeeting, rosterFor, indexFor, poolFor, extFor, chairOf,
  UI as t, EXT_FREQ, DEFAULT_CONFIG, HISTORIAN, REGENT, STYLE_LIST,
  buildTurnPrompt, buildHistorianPrompt, buildRegentPrompt,
} from './councils'
import { streamText, DEFAULT_MODELS } from './llm'
import { Plaque, EdictCard, SpeechCard, FengjianCard, RecordCard, ErrorCard } from './components/ui'
import { SettingsPanel, MusterPanel } from './components/panels'

const load = (k, fb) => {
  try {
    const v = localStorage.getItem(k)
    return v ? { ...fb, ...JSON.parse(v) } : fb
  } catch {
    return fb
  }
}
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v))

const defaultSettings = () => ({
  keys: { anthropic: '', openai: '', gemini: '' },
  models: { ...DEFAULT_MODELS },
  defaultProvider: 'anthropic',
})
const defaultProfile = () => ({
  title: '', background: '', extFreq: 'some', chair: 'principal',
})

let seq = 0
const uid = () => `e${Date.now()}_${seq++}`
const TAG = { anthropic: 'Claude', openai: 'GPT', gemini: 'Gemini' }

const GATE_CHARS = {
  school: ['教', '校', '職'],
  teachers: ['導', '教', '科'],
  parents: ['親', '家', '長'],
  joint: ['教', '校', '家'],
}
const GATE_ROW = ['teachers', 'school', 'parents']
const CHAIR_CHAR = { principal: '校', t_chair: '師', p_chair: '長' }

export default function App() {
  const [settings, setSettings] = useState(() => load('sc.settings', defaultSettings()))
  const [config, setConfig] = useState(() => load('sc.config', DEFAULT_CONFIG))
  const [councilId, setCouncilId] = useState(() => localStorage.getItem('sc.council') || '')
  const [meetingId, setMeetingId] = useState(() => localStorage.getItem('sc.meeting') || '')

  const council = getCouncil(councilId || 'school')
  const meeting = meetingId ? getMeeting(council, meetingId) : null
  const idx = useMemo(() => indexFor(council), [council])

  const [profile, setProfile] = useState(() =>
    load(`sc.profile.${councilId || 'school'}`, defaultProfile())
  )
  const [roster, setRoster] = useState(() =>
    meetingId
      ? load(`sc.roster.${councilId}.${meetingId}`, rosterFor(council, getMeeting(council, meetingId), load('sc.config', DEFAULT_CONFIG)))
      : {}
  )

  const [showSettings, setShowSettings] = useState(false)
  const [showMuster, setShowMuster] = useState(false)
  const [feed, setFeed] = useState([])
  const [running, setRunning] = useState(false)
  const [speaker, setSpeaker] = useState(null)
  const [regentOut, setRegentOut] = useState(false)
  const [input, setInput] = useState('')

  const ctrl = useRef(null)
  const mode = useRef('run')
  const lastRecord = useRef('')
  const feedRef = useRef(null)

  const hasKey = Object.values(settings.keys).some(Boolean)
  const chair = chairOf(council, profile, meeting)

  useEffect(() => {
    const el = feedRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [feed])

  const setCfg = (c) => {
    setConfig(c)
    save('sc.config', c)
  }

  const enterCouncil = (id) => {
    setCouncilId(id)
    localStorage.setItem('sc.council', id)
    setMeetingId('')
    localStorage.removeItem('sc.meeting')
    setProfile(load(`sc.profile.${id}`, defaultProfile()))
    setFeed([])
    lastRecord.current = ''
  }

  const pickMeeting = (mid) => {
    const m = getMeeting(council, mid)
    setMeetingId(mid)
    localStorage.setItem('sc.meeting', mid)
    setRoster(load(`sc.roster.${councilId}.${mid}`, rosterFor(council, m, config)))
    setFeed([])
    lastRecord.current = ''
  }

  const leaveMeeting = () => {
    if (running) return
    setMeetingId('')
    localStorage.removeItem('sc.meeting')
    setFeed([])
    lastRecord.current = ''
  }

  const leaveCouncil = () => {
    if (running) return
    setCouncilId('')
    localStorage.removeItem('sc.council')
    setMeetingId('')
    localStorage.removeItem('sc.meeting')
    setFeed([])
    lastRecord.current = ''
  }

  const setChair = (roleId) => {
    const p = { ...profile, chair: roleId }
    setProfile(p)
    save(`sc.profile.${councilId}`, p)
  }

  const conn = (id) => {
    let p = roster[id]?.provider || settings.defaultProvider
    if (!settings.keys[p]) p = Object.keys(settings.keys).find((k) => settings.keys[k]) || p
    return { provider: p, model: settings.models[p], apiKey: settings.keys[p] }
  }

  const speakOne = async (official, prompts, kind = 'speech') => {
    const id = uid()
    const c = conn(official.id)
    const tag = `${TAG[c.provider] || c.provider}・${c.model}`
    setFeed((f) => [...f, { id, kind, off: official.id, text: '', done: false, tag }])
    setSpeaker(official.id)
    let acc = ''
    try {
      const maxTokens = kind === 'record' ? 1600 : 1000
      for await (const ch of streamText({ ...c, ...prompts, maxTokens, signal: ctrl.current.signal })) {
        acc += ch
        setFeed((f) => f.map((e) => (e.id === id ? { ...e, text: acc } : e)))
      }
      setFeed((f) => f.map((e) => (e.id === id ? { ...e, done: true } : e)))
      return { ok: true, name: official.name, text: acc }
    } catch (err) {
      if (err.name === 'AbortError') {
        setFeed((f) => f.map((e) => (e.id === id ? { ...e, done: true } : e)))
        return { ok: false, name: official.name, text: acc }
      }
      setFeed((f) => [
        ...f.map((e) => (e.id === id ? { ...e, done: true } : e)),
        { id: uid(), kind: 'error', off: official.id, text: String(err.message || err) },
      ])
      return { ok: false, name: official.name, text: acc }
    }
  }

  const runCouncil = async (edict, { regentOnly = false } = {}) => {
    setRunning(true)
    mode.current = regentOnly ? 'regent' : 'run'
    ctrl.current = new AbortController()
    setFeed((f) => [...f, { id: uid(), kind: 'edict', text: edict }])

    const turns = []
    const order = poolFor(council, config).filter(
      (o) => o.id !== chair.roleId && roster[o.id]?.enabled
    )
    const extPool = extFor(council, config)
    const interjectors = extPool.filter((h) => !h.isMatriarch && roster[h.id]?.enabled)
    const matriarch = extPool.find((h) => h.isMatriarch && roster[h.id]?.enabled)
    const freqP = EXT_FREQ[profile.extFreq] ?? 0
    const used = new Set()

    const maybeInterject = async () => {
      if (mode.current !== 'run' || freqP <= 0) return
      const cand = interjectors.filter((h) => !used.has(h.id))
      if (!cand.length || Math.random() >= freqP) return
      const who = cand[Math.floor(Math.random() * cand.length)]
      used.add(who.id)
      const r = await speakOne(who, buildTurnPrompt(council, meeting, who, edict, turns, profile, config, lastRecord.current), 'fengjian')
      if (r.text) turns.push({ name: r.name, text: r.text })
    }

    for (let i = 0; i < order.length; i++) {
      if (mode.current !== 'run') break
      const off = order[i]
      const r = await speakOne(off, buildTurnPrompt(council, meeting, off, edict, turns, profile, config, lastRecord.current))
      if (r.text) turns.push({ name: r.name, text: r.text })
      if (mode.current !== 'run') break
      if (i < order.length - 1) await maybeInterject()
    }

    // 督學／前輩／榮譽會長壓軸總評
    if (mode.current === 'run' && matriarch) {
      const r = await speakOne(matriarch, buildTurnPrompt(council, meeting, matriarch, edict, turns, profile, config, lastRecord.current), 'fengjian')
      if (r.text) turns.push({ name: r.name, text: r.text })
    }

    if (mode.current === 'regent') {
      ctrl.current = new AbortController()
      setRegentOut(true)
      const r = await speakOne(REGENT, buildRegentPrompt(council, meeting, edict, turns, profile, config, lastRecord.current))
      if (r.text) turns.push({ name: r.name, text: r.text })
    }

    if (turns.length) {
      ctrl.current = new AbortController()
      const r = await speakOne(HISTORIAN, buildHistorianPrompt(council, meeting, edict, turns, profile, config, lastRecord.current), 'record')
      if (r.ok && r.text) lastRecord.current = r.text
    }

    setRunning(false)
    setSpeaker(null)
    setRegentOut(false)
  }

  const submit = (regentOnly = false) => {
    const text = input.trim()
    if (!text || running) return
    if (!hasKey) {
      setShowSettings(true)
      return
    }
    setInput('')
    runCouncil(text, { regentOnly })
  }

  // ─── 大門：擇一入口 ───────────────────────────────────────
  if (!councilId) {
    return (
      <div className="gate">
        <motion.div className="gate-board wide" initial={{ opacity: 0, y: -24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <h1 className="gate-title">{t.gateTitle}</h1>

          <div className="court-pick three">
            {GATE_ROW.map((id) => {
              const c = COUNCILS[id]
              return (
                <button key={c.id} className={`court-card cc-${c.id}`} onClick={() => enterCouncil(c.id)}>
                  <div className="court-faces">
                    {GATE_CHARS[c.id].map((ch, i) => (
                      <span key={i} className="face-char">{ch}</span>
                    ))}
                  </div>
                  <h2>{c.label}</h2>
                  <div className="joint-tags">
                    {c.meetings.map((m) => (
                      <span key={m.id} className="joint-tag">{m.name}</span>
                    ))}
                  </div>
                </button>
              )
            })}
          </div>

          <button className="court-card wide" onClick={() => enterCouncil('joint')}>
            <div className="court-faces">
              {GATE_CHARS.joint.map((ch, i) => (
                <span key={i} className="face-char">{ch}</span>
              ))}
            </div>
            <h2>{COUNCILS.joint.label}</h2>
            <div className="joint-tags">
              {COUNCILS.joint.meetings.map((m) => (
                <span key={m.id} className="joint-tag">{m.name}</span>
              ))}
            </div>
          </button>

          <p className="gate-sub">{t.gateSub}</p>

          <div className="cfg-bar">
            <span className="cfg-label">{t.cfgTitle}</span>
            <div className="freq-pills">
              <button className="freq-pill on"
                onClick={() => setCfg({ ...config, scale: config.scale === 'small' ? 'large' : 'small' })}>
                {config.scale === 'small' ? t.scaleSmall : t.scaleLarge}
              </button>
              <button className="freq-pill on"
                onClick={() => setCfg({ ...config, kinder: !config.kinder })}>
                {config.kinder ? t.kinderYes : t.kinderNo}
              </button>
            </div>
          </div>
          <div className="cfg-bar cfg-styles">
            <span className="cfg-label">{t.cfgStyle}</span>
            {[STYLE_LIST.slice(0, 6), STYLE_LIST.slice(6)].map((row, i) => (
              <div className="freq-pills" key={i}>
                {row.map((s) => (
                  <button key={s.id} className={`freq-pill ${(config.style || 'default') === s.id ? 'on' : ''}`}
                    onClick={() => setCfg({ ...config, style: s.id })}>
                    {s.label}
                  </button>
                ))}
              </div>
            ))}
          </div>
          <p className="gate-foot">{t.gateFoot}</p>
        </motion.div>
      </div>
    )
  }

  // ─── 未設金鑰 ─────────────────────────────────────────────
  if (!hasKey) {
    return (
      <div className="gate">
        <motion.div className="gate-board" initial={{ opacity: 0, y: -24 }} animate={{ opacity: 1, y: 0 }}>
          <p className="gate-eyebrow">{council.sub}</p>
          <h1 className="gate-title">{council.label}</h1>
          <p className="gate-sub">{t.gateSub}</p>
          <div className="gate-actions">
            <button className="btn primary big" onClick={() => setShowSettings(true)}>{t.gateKey}</button>
            <button className="btn ghost" onClick={leaveCouncil}>{t.switchCouncil}</button>
          </div>
          <p className="gate-foot">{t.gateFoot}</p>
        </motion.div>
        {showSettings && (
          <SettingsPanel settings={settings} onClose={() => setShowSettings(false)}
            onSave={(d) => { setSettings(d); save('sc.settings', d); setShowSettings(false) }} />
        )}
      </div>
    )
  }

  // ─── 選擇會議 ─────────────────────────────────────────────
  if (!meetingId) {
    return (
      <div className="gate">
        <motion.div className="gate-board wide" initial={{ opacity: 0, y: -24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <p className="gate-eyebrow">{council.sub}</p>
          <h1 className="gate-title">{council.label}</h1>

          {council.chairOptions && (
            <div className="cfg-bar">
              <span className="cfg-label">{t.chairPick}</span>
              <div className="freq-pills">
                {council.chairOptions.map((c) => (
                  <button key={c.roleId} className={`freq-pill ${chair.roleId === c.roleId ? 'on' : ''}`}
                    onClick={() => setChair(c.roleId)}>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="meeting-list">
            {council.meetings.map((m) => {
              const mChair = chairOf(council, profile, m)
              const n = [...poolFor(council, config)]
                .filter((o) => o.id !== mChair.roleId && (m.defaultOn || []).includes(o.id)).length
              return (
                <button key={m.id} className="meeting-card" onClick={() => pickMeeting(m.id)}>
                  <h3>{m.name}</h3>
                  <p>{m.desc}</p>
                  <span className="meeting-n">{mChair.label}主持・預設出席 {n} 位</span>
                </button>
              )
            })}
          </div>
          <div className="gate-actions">
            <button className="btn ghost" onClick={leaveCouncil}>{t.backGate}</button>
          </div>
        </motion.div>
      </div>
    )
  }

  // ─── 會議室 ───────────────────────────────────────────────
  const order = poolFor(council, config).filter(
    (o) => o.id !== chair.roleId && roster[o.id]?.enabled
  )
  const half = Math.ceil(order.length / 2)
  const left = order.slice(0, half)
  const right = order.slice(half)
  const veil = extFor(council, config).filter((h) => roster[h.id]?.enabled)
  const pState = (id) => (!running ? 'idle' : speaker === id ? 'speaking' : 'dim')

  return (
    <div className="hall">
      <header className="hall-head">
        <button className="btn ghost" onClick={() => setShowSettings(true)}>{t.settings}</button>
        <button className="hall-board" onClick={leaveMeeting} title={t.pickMeeting}>
          <h1>{meeting.name}</h1>
          <p>{t.hallSub(profile.title || chair.label, council.label)}</p>
        </button>
        <button className="btn ghost" onClick={() => setShowMuster(true)}>{t.muster}</button>
      </header>

      <section className="ban">
        <div className="ban-side">
          {left.map((o) => <Plaque key={o.id} official={o} state={pState(o.id)} />)}
        </div>
        <div className="ban-center">
          <AnimatePresence>
            {regentOut && (
              <motion.div key="regent" initial={{ opacity: 0, y: -30, scale: 0.6 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }}>
                <Plaque official={REGENT} state={speaker === REGENT.id ? 'speaking' : 'idle'} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="ban-side right">
          {right.map((o) => <Plaque key={o.id} official={o} state={pState(o.id)} />)}
          <Plaque official={HISTORIAN} state={pState(HISTORIAN.id)} />
          {veil.length > 0 && (
            <div className="veil">
              <span className="veil-label">{t.veil}</span>
              <div className="veil-row">
                {veil.map((h) => <Plaque key={h.id} official={h} state={pState(h.id)} />)}
              </div>
            </div>
          )}
        </div>
      </section>

      <main className="feed" ref={feedRef}>
        {feed.length === 0 && (
          <div className="feed-empty">
            <p>{t.emptyA}</p>
            <p>{t.emptyB}</p>
          </div>
        )}
        {feed.map((e) => {
          const off = idx[e.off]
          if (e.kind === 'edict')
            return <EdictCard key={e.id} text={e.text} avatar="" label={t.edictLabel} char={CHAIR_CHAR[chair.roleId] || '主'} />
          if (e.kind === 'fengjian') return <FengjianCard key={e.id} entry={e} official={off} />
          if (e.kind === 'record') return <RecordCard key={e.id} entry={e} t={t} char={HISTORIAN.char} />
          if (e.kind === 'error') return <ErrorCard key={e.id} entry={e} official={off} t={t} />
          return (
            <SpeechCard key={e.id} entry={e} official={off}
              isCensor={off.faction === 'censor'} isRegent={off.id === REGENT.id} />
          )
        })}
      </main>

      <footer className="throne">
        <span className="throne-seal">{CHAIR_CHAR[chair.roleId] || '主'}</span>
        <textarea
          placeholder={t.placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit() }}
          rows={2}
          disabled={running}
        />
        <div className="throne-actions">
          {running ? (
            <>
              <button className="btn regent-btn" onClick={() => { mode.current = 'regent'; ctrl.current?.abort() }}
                disabled={regentOut || speaker === HISTORIAN.id}>
                {t.lazy}
              </button>
              <button className="btn danger" onClick={() => { mode.current = 'dismiss'; ctrl.current?.abort() }}>
                {t.dismiss}
              </button>
            </>
          ) : (
            <>
              <button className="btn primary" onClick={() => submit()} disabled={!input.trim()}>{t.submit}</button>
              <button className="btn regent-btn" onClick={() => submit(true)} disabled={!input.trim()}>{t.lazy}</button>
            </>
          )}
        </div>
      </footer>

      {showSettings && (
        <SettingsPanel settings={settings} onClose={() => setShowSettings(false)}
          onSave={(d) => { setSettings(d); save('sc.settings', d); setShowSettings(false) }} />
      )}
      {showMuster && (
        <MusterPanel council={council} meeting={meeting} roster={roster} profile={profile} config={config}
          onClose={() => setShowMuster(false)}
          onSave={(r, p, c) => {
            setRoster(r); setProfile(p); setCfg(c)
            save(`sc.roster.${councilId}.${meetingId}`, r)
            save(`sc.profile.${councilId}`, p)
            setShowMuster(false)
          }} />
      )}
    </div>
  )
}
