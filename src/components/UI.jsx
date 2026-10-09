// ─── Shared Design System ────────────────────────────────────────────────────

export const C = {
  bg: '#05090f', surface: '#0a1020', border: '#131e30', accent: '#0ea5e9',
  accentDim: '#0c4a6e', text: '#f1f5f9', muted: '#475569', faint: '#1e293b',
}

export const scoreColor = s => s >= 80 ? '#10b981' : s >= 65 ? '#0ea5e9' : s >= 50 ? '#f59e0b' : '#ef4444'

export const recStyle = {
  'Highly Recommended': { c: '#10b981', bg: '#051510', b: '#065f46' },
  'Recommended':        { c: '#0ea5e9', bg: '#071828', b: '#0c4a6e' },
  'Consider':           { c: '#f59e0b', bg: '#1c1405', b: '#78350f' },
  'Pass':               { c: '#ef4444', bg: '#150505', b: '#7f1d1d' },
}

export function Ring({ score, size = 64 }) {
  const r = (size - 8) / 2, circ = 2 * Math.PI * r
  const fill = (score / 100) * circ, col = scoreColor(score)
  return (
    <svg width={size} height={size}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.faint} strokeWidth={6} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth={6}
        strokeDasharray={`${fill} ${circ - fill}`} strokeDashoffset={circ / 4}
        strokeLinecap="round" style={{ transition: 'stroke-dasharray 1s ease' }} />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
        fill={col} fontSize={size < 60 ? 11 : size < 90 ? 15 : 22}
        fontFamily="'JetBrains Mono', monospace" fontWeight="700">{score}</text>
    </svg>
  )
}

export function Pill({ label, rec }) {
  const s = rec ? (recStyle[label] || recStyle['Pass']) : { c: C.muted, bg: C.surface, b: C.faint }
  return (
    <span style={{ background: s.bg, color: s.c, border: `1px solid ${s.b}`, padding: '2px 8px',
      borderRadius: 4, fontSize: 10, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700,
      letterSpacing: 0.8, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
      {label}
    </span>
  )
}

export function Spinner({ size = 14, color = C.accent }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16"
      style={{ animation: 'spin .7s linear infinite', flexShrink: 0 }}>
      <circle cx={8} cy={8} r={6} fill="none" stroke={color} strokeWidth={2.5} strokeDasharray="20 8" />
    </svg>
  )
}

export function Btn({ children, onClick, variant = 'primary', disabled, sm, full, danger }) {
  const v = {
    primary:   { bg: C.accent,   c: '#000',   b: C.accent },
    secondary: { bg: C.surface,  c: C.muted,  b: C.faint  },
    ghost:     { bg: 'transparent', c: C.muted, b: 'transparent' },
  }
  const s = danger ? { bg: '#150505', c: '#f87171', b: '#7f1d1d' } : v[variant]
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: disabled ? '#111' : s.bg, color: disabled ? '#334155' : s.c,
      border: `1px solid ${disabled ? '#1a1a1a' : s.b}`, borderRadius: 8,
      padding: sm ? '5px 12px' : '9px 18px', cursor: disabled ? 'not-allowed' : 'pointer',
      fontFamily: "'JetBrains Mono', monospace", fontSize: sm ? 10 : 11,
      fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase',
      width: full ? '100%' : undefined, display: 'inline-flex', alignItems: 'center',
      gap: 6, transition: 'all .15s', whiteSpace: 'nowrap',
    }}>
      {children}
    </button>
  )
}

export function Field({ label, value, onChange, placeholder, multi, rows = 5, type = 'text' }) {
  const base = {
    width: '100%', background: '#070d1a', border: `1px solid ${C.faint}`, borderRadius: 8,
    padding: '9px 13px', color: C.text, fontFamily: "'DM Sans', sans-serif", fontSize: 14,
    outline: 'none', boxSizing: 'border-box', transition: 'border-color .2s',
    resize: multi ? 'vertical' : undefined,
  }
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: C.accent,
        letterSpacing: 3, textTransform: 'uppercase', marginBottom: 5 }}>{label}</div>}
      {multi
        ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
            rows={rows} style={base}
            onFocus={e => e.target.style.borderColor = C.accent}
            onBlur={e => e.target.style.borderColor = C.faint} />
        : <input type={type} value={value} onChange={e => onChange(e.target.value)}
            placeholder={placeholder} style={base}
            onFocus={e => e.target.style.borderColor = C.accent}
            onBlur={e => e.target.style.borderColor = C.faint} />}
    </div>
  )
}

export function Modal({ title, onClose, children, w = 560 }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.8)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: 20 }}
      onClick={onClose}>
      <div style={{ background: '#0b1525', border: `1px solid ${C.border}`, borderRadius: 16,
        width: '100%', maxWidth: w, maxHeight: '92vh', overflowY: 'auto', padding: 28 }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 19, color: C.text, fontWeight: 600 }}>{title}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 22, lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Stat({ label, value, sub, col = C.accent }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.faint}`, borderRadius: 12, padding: '18px 22px' }}>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: C.muted, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 30, color: col, fontWeight: 700, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: C.muted, marginTop: 5 }}>{sub}</div>}
    </div>
  )
}

export function Empty({ icon, msg }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: C.muted }}>{msg}</div>
    </div>
  )
}

export function FullLoad({ msg }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', gap: 10, color: C.muted,
      fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>
      <Spinner size={18} /> {msg}
    </div>
  )
}
