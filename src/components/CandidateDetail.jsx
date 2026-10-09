import { useState } from 'react'
import { C, Ring, Pill, Btn, Modal } from './UI'

const STATUSES = ['New', 'Shortlisted', 'Interviewing', 'Offered', 'Rejected', 'Hired']

export function CandidateDetail({ c, jobs, onClose, onStatus, onDelete }) {
  const [showCV, setShowCV] = useState(false)
  const job = jobs.find(j => j.id === c.jobId)

  return (
    <Modal title={c.name} onClose={onClose} w={680}>
      {/* Header */}
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', paddingBottom: 20, borderBottom: `1px solid ${C.faint}`, marginBottom: 20 }}>
        <Ring score={c.score} size={88} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: C.muted, marginBottom: 4 }}>{c.email || '—'}</div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>{c.summary}</div>
          <div style={{ marginTop: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: C.muted }}>
            Applied to: <span style={{ color: C.accent }}>{job?.title || '—'}</span>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 }}>
        {[['Grade', c.grade], ['Experience', c.experience_match], ['Education', c.education_match]].map(([k, v]) => (
          <div key={k} style={{ background: C.surface, border: `1px solid ${C.faint}`, borderRadius: 8, padding: 12, textAlign: 'center' }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: C.muted, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 3 }}>{k}</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 15, color: C.accent, fontWeight: 700 }}>{v || '—'}</div>
          </div>
        ))}
      </div>

      {/* Strengths & Gaps */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: '#10b981', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Strengths</div>
          {(c.strengths || []).map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 7, marginBottom: 6 }}>
              <span style={{ color: '#10b981', fontSize: 11, flexShrink: 0 }}>✓</span>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#6ee7b7' }}>{s}</span>
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: '#f87171', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Gaps</div>
          {(c.gaps || []).map((g, i) => (
            <div key={i} style={{ display: 'flex', gap: 7, marginBottom: 6 }}>
              <span style={{ color: '#f87171', fontSize: 11, flexShrink: 0 }}>↑</span>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#fca5a5' }}>{g}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Skills */}
      {c.skills?.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: C.muted, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Skills Detected</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {c.skills.map(s => (
              <span key={s} style={{ background: '#071828', border: `1px solid ${C.accentDim}`, borderRadius: 4, padding: '3px 10px', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: C.accent }}>{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* Pipeline status */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: C.muted, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Pipeline Status</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {STATUSES.map(st => (
            <button key={st} onClick={() => onStatus(st)} style={{
              background: c.status === st ? '#071828' : 'transparent',
              border: `1px solid ${c.status === st ? C.accent : C.faint}`,
              borderRadius: 6, padding: '5px 11px', cursor: 'pointer',
              fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: 0.8,
              textTransform: 'uppercase', color: c.status === st ? C.accent : C.muted,
              transition: 'all .15s',
            }}>{st}</button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: `1px solid ${C.faint}` }}>
        <Btn danger sm onClick={onDelete}>Delete</Btn>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Btn variant="secondary" sm onClick={() => setShowCV(!showCV)}>{showCV ? 'Hide' : 'View'} Resume</Btn>
          <Pill label={c.recommendation} rec />
        </div>
      </div>

      {showCV && (
        <div style={{ marginTop: 14, background: '#050b14', border: `1px solid ${C.faint}`, borderRadius: 8, padding: 14, maxHeight: 280, overflowY: 'auto' }}>
          <pre style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: C.muted, whiteSpace: 'pre-wrap', margin: 0, lineHeight: 1.7 }}>{c.resumeText}</pre>
        </div>
      )}
    </Modal>
  )
}
