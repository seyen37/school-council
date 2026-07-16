import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { marked } from 'marked'
import { UI, EXT_FREQ, poolFor, extFor, chairOf, STYLE_LIST } from '../councils'
import { PROVIDERS } from '../llm'
import { GUIDE_MD } from '../guide'

function Modal({ title, children, onClose, closeLabel, wide }) {
  return (
    <AnimatePresence>
      <motion.div
        className="modal-mask"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className={`modal ${wide ? 'wide' : ''}`}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-head">
            <h2>{title}</h2>
            <button className="btn ghost small" onClick={onClose}>
              {closeLabel}
            </button>
          </div>
          <div className="modal-body">{children}</div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ─── 使用說明 ───────────────────────────────────────────────
export function GuidePanel({ onClose }) {
  return (
    <Modal title={UI.guideTitle} onClose={onClose} closeLabel={UI.close} wide>
      <div
        className="guide-paper record-body"
        dangerouslySetInnerHTML={{ __html: marked.parse(GUIDE_MD) }}
      />
    </Modal>
  )
}

// ─── 金鑰 ───────────────────────────────────────────────────
export function SettingsPanel({ settings, onSave, onClose }) {
  const t = UI
  const [draft, setDraft] = useState(() => JSON.parse(JSON.stringify(settings)))
  const [reveal, setReveal] = useState({})

  const setKey = (p, v) => setDraft((d) => ({ ...d, keys: { ...d.keys, [p]: v } }))
  const setModel = (p, v) => setDraft((d) => ({ ...d, models: { ...d.models, [p]: v } }))

  return (
    <Modal title={t.settingsTitle} onClose={onClose} closeLabel={t.close}>
      <p className="hint">{t.settingsHint}</p>
      {Object.entries(PROVIDERS).map(([p, meta]) => (
        <div className="field-group" key={p}>
          <label className="field-label">{meta.label}</label>
          <div className="field-row">
            <input
              type={reveal[p] ? 'text' : 'password'}
              placeholder={meta.placeholder}
              value={draft.keys[p]}
              onChange={(e) => setKey(p, e.target.value.trim())}
              autoComplete="off"
            />
            <button className="btn ghost small" onClick={() => setReveal((r) => ({ ...r, [p]: !r[p] }))}>
              {reveal[p] ? t.hide : t.show}
            </button>
          </div>
          <div className="field-row">
            <span className="field-sub">{t.model}</span>
            <input type="text" value={draft.models[p]} onChange={(e) => setModel(p, e.target.value.trim())} />
          </div>
        </div>
      ))}
      <div className="field-group">
        <label className="field-label">{t.defaultProvider}</label>
        <select
          value={draft.defaultProvider}
          onChange={(e) => setDraft((d) => ({ ...d, defaultProvider: e.target.value }))}
        >
          {Object.entries(PROVIDERS).map(([p, meta]) => (
            <option key={p} value={p}>{meta.label}</option>
          ))}
        </select>
      </div>
      <div className="modal-actions">
        <button className="btn primary" onClick={() => onSave(draft)}>{t.saveKeys}</button>
      </div>
    </Modal>
  )
}

function MusterRow({ official, row, t, onToggle, onProv }) {
  return (
    <div className={`muster-row ${row?.enabled ? 'on' : ''}`}>
      <label className="muster-main">
        <input type="checkbox" checked={!!row?.enabled} onChange={onToggle} />
        <span className={`muster-char f-${official.faction}`}>{official.char}</span>
        <span className="muster-name">{official.name}</span>
        <span className="muster-modern">{official.modern}</span>
      </label>
      <select value={row?.provider || ''} onChange={(e) => onProv(e.target.value)} title={t.provTip}>
        <option value="">{t.provDefault}</option>
        {Object.entries(PROVIDERS).map(([p, meta]) => (
          <option key={p} value={p}>{meta.label}</option>
        ))}
      </select>
    </div>
  )
}

const GROUPS = [
  { label: '學校行政', factions: ['civil', 'censor'] },
  { label: '專業人員', factions: ['advisor'] },
  { label: '教師', factions: ['military'] },
  { label: '家長', factions: ['secret'] },
]

// ─── 點名 ───────────────────────────────────────────────────
export function MusterPanel({ council, meeting, roster, profile, config, onSave, onClose }) {
  const t = UI
  const [rDraft, setRDraft] = useState(() => JSON.parse(JSON.stringify(roster)))
  const [pDraft, setPDraft] = useState(() => ({ ...profile }))
  const [cDraft, setCDraft] = useState(() => ({ ...config }))

  const chair = chairOf(council, pDraft, meeting)
  const defaultOn = new Set(meeting?.defaultOn || [])
  const row = (id) => rDraft[id] || { enabled: defaultOn.has(id), provider: '' }
  const toggle = (id) => setRDraft((r) => ({ ...r, [id]: { ...row(id), enabled: !row(id).enabled } }))
  const setProv = (id, v) => setRDraft((r) => ({ ...r, [id]: { ...row(id), provider: v } }))
  const setP = (k, v) => setPDraft((p) => ({ ...p, [k]: v }))

  const pool = poolFor(council, cDraft).filter((o) => o.id !== chair.roleId)
  const ext = extFor(council, cDraft)
  const onCount = pool.filter((o) => row(o.id).enabled).length
  const extCount = ext.filter((o) => row(o.id).enabled).length

  return (
    <Modal title={t.musterTitle} onClose={onClose} closeLabel={t.close}>
      <p className="hint">{t.musterHint(onCount, extCount)}</p>

      <h3 className="muster-section">{t.cfgTitle}</h3>
      <div className="field-group">
        <div className="freq-pills">
          <button className="freq-pill on"
            onClick={() => setCDraft((c) => ({ ...c, scale: c.scale === 'small' ? 'large' : 'small' }))}>
            {cDraft.scale === 'small' ? t.scaleSmall : t.scaleLarge}
          </button>
          <button className="freq-pill on"
            onClick={() => setCDraft((c) => ({ ...c, kinder: !c.kinder }))}>
            {cDraft.kinder ? t.kinderYes : t.kinderNo}
          </button>
        </div>
      </div>
      <div className="field-group">
        <label className="field-label">{t.cfgStyle}</label>
        <div className="freq-pills">
          {STYLE_LIST.map((s) => (
            <button key={s.id} className={`freq-pill ${(cDraft.style || 'default') === s.id ? 'on' : ''}`}
              onClick={() => setCDraft((c) => ({ ...c, style: s.id }))}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <h3 className="muster-section">{t.sectionCouncil}</h3>
      {GROUPS.map((g) => {
        const members = pool.filter((o) => g.factions.includes(o.faction))
        if (!members.length) return null
        return (
          <div key={g.label}>
            <p className="field-sub" style={{ margin: '10px 2px 4px' }}>{g.label}</p>
            <div className="muster-list">
              {members.map((o) => (
                <MusterRow key={o.id} official={o} row={row(o.id)} t={t}
                  onToggle={() => toggle(o.id)} onProv={(v) => setProv(o.id, v)} />
              ))}
            </div>
          </div>
        )
      })}

      <h3 className="muster-section harem">{t.sectionExt}</h3>
      <p className="hint">{t.extHint}</p>
      <div className="muster-list">
        {ext.map((h) => (
          <MusterRow key={h.id} official={h} row={row(h.id)} t={t}
            onToggle={() => toggle(h.id)} onProv={(v) => setProv(h.id, v)} />
        ))}
      </div>
      <div className="field-group">
        <label className="field-label">{t.freqLabel}</label>
        <div className="freq-pills">
          {Object.keys(EXT_FREQ).map((k) => (
            <button key={k} className={`freq-pill ${pDraft.extFreq === k ? 'on' : ''}`}
              onClick={() => setP('extFreq', k)}>
              {t.freq[k]}
            </button>
          ))}
        </div>
      </div>

      <h3 className="muster-section">{t.sectionChair}</h3>
      <div className="field-group">
        <div className="field-row">
          <input type="text" placeholder={t.chairTitleLabel} value={pDraft.title || ''}
            onChange={(e) => setP('title', e.target.value)} />
        </div>
      </div>
      <div className="field-group">
        <label className="field-label">{t.chairBgLabel}</label>
        <textarea rows={2} placeholder={t.chairBgPh} value={pDraft.background || ''}
          onChange={(e) => setP('background', e.target.value)} />
      </div>

      <div className="modal-actions">
        <button className="btn primary" onClick={() => onSave(rDraft, pDraft, cDraft)}>{t.saveMuster}</button>
      </div>
    </Modal>
  )
}
