import { motion } from 'framer-motion'
import { marked } from 'marked'

// ─── 立牌：東方用 Q 版立繪，西方用紋章徽記 ─────────────────
export function Plaque({ official, state, heraldic }) {
  const anim =
    state === 'speaking'
      ? { y: -14, scale: 1.16, opacity: 1 }
      : state === 'dim'
        ? { y: 0, scale: 1, opacity: 0.35 }
        : { y: 0, scale: 1, opacity: 1 }
  return (
    <motion.div
      className={`plaque f-${official.faction} ${state === 'speaking' ? 'is-speaking' : ''} ${heraldic ? 'heraldic' : ''}`}
      animate={anim}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      title={`${official.name}｜${official.modern}`}
    >
      {official.avatar ? (
        <img className="plaque-img" src={official.avatar} alt={official.name} />
      ) : (
        <span className="plaque-char">{official.char}</span>
      )}
      <span className="plaque-name">{official.name}</span>
    </motion.div>
  )
}

// ─── 聖諭卡 ─────────────────────────────────────────────────
export function EdictCard({ text, avatar, label, char }) {
  return (
    <motion.div className="card edict" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <div className="edict-head">
        {avatar ? (
          <img className="edict-avatar" src={avatar} alt={label} />
        ) : (
          <span className="edict-seal">{char}</span>
        )}
        <span className="edict-title">{label}</span>
      </div>
      <p className="card-text">{text}</p>
    </motion.div>
  )
}

// ─── 奏摺卡 ─────────────────────────────────────────────────
export function SpeechCard({ entry, official, isCensor, isRegent }) {
  return (
    <motion.div
      className={`card speech f-${official.faction} ${isCensor ? 'impeach' : ''} ${isRegent ? 'regent' : ''}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 22 }}
    >
      <div className="speech-head">
        {official.avatar ? (
          <img className="speech-avatar" src={official.avatar} alt={official.name} />
        ) : (
          <span className="speech-seal">{official.char}</span>
        )}
        <div className="speech-who">
          <span className="speech-name">{official.name}</span>
          <span className="speech-modern">{official.modern}</span>
        </div>
        {entry.tag && <span className="speech-tag">{entry.tag}</span>}
      </div>
      <p className="card-text">
        {entry.text}
        {!entry.done && <span className="cursor">▍</span>}
      </p>
    </motion.div>
  )
}

// ─── 鳳箋（簾後干政，自右側飄入） ───────────────────────────
export function FengjianCard({ entry, official }) {
  return (
    <motion.div
      className="card fengjian"
      initial={{ opacity: 0, x: 70, rotate: 2.5 }}
      animate={{ opacity: 1, x: 0, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 160, damping: 18 }}
    >
      <span className="fengjian-label">{official.label}</span>
      <div className="speech-head">
        {official.avatar ? (
          <img className="speech-avatar harem-ring" src={official.avatar} alt={official.name} />
        ) : (
          <span className="speech-seal harem-seal">{official.char}</span>
        )}
        <div className="speech-who">
          <span className="speech-name">{official.name}</span>
          <span className="speech-modern">{official.modern}</span>
        </div>
        {entry.tag && <span className="speech-tag">{entry.tag}</span>}
      </div>
      <p className="card-text">
        {entry.text}
        {!entry.done && <span className="cursor">▍</span>}
      </p>
    </motion.div>
  )
}

// ─── 實錄捲軸 ───────────────────────────────────────────────
export function RecordCard({ entry, t, char }) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(entry.text)
      const el = document.getElementById('copy-btn-' + entry.id)
      if (el) {
        el.textContent = t.copied
        setTimeout(() => (el.textContent = t.copy), 1600)
      }
    } catch { /* noop */ }
  }
  return (
    <motion.div
      className="scroll-wrap"
      initial={{ opacity: 0, scaleY: 0.1 }}
      animate={{ opacity: 1, scaleY: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="scroll-roller top" />
      <div className="scroll-paper">
        <div className="scroll-head">
          <span className="scroll-seal">{char}</span>
          <span className="scroll-title">{t.recordTitle}</span>
          {entry.done && (
            <button id={'copy-btn-' + entry.id} className="btn ghost small" onClick={copy}>
              {t.copy}
            </button>
          )}
        </div>
        {entry.done ? (
          <div className="record-body" dangerouslySetInnerHTML={{ __html: marked.parse(entry.text || '') }} />
        ) : (
          <p className="card-text record-stream">
            {entry.text}
            <span className="cursor">▍</span>
          </p>
        )}
      </div>
      <div className="scroll-roller bottom" />
    </motion.div>
  )
}

// ─── 出錯 ───────────────────────────────────────────────────
export function ErrorCard({ entry, official, t }) {
  return (
    <motion.div className="card err" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <p className="card-text">
        {official ? t.errPrefix(official.name) : t.errPlain}
        {entry.text}
      </p>
    </motion.div>
  )
}
