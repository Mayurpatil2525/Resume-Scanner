import { useState, useEffect, useCallback } from 'react'
import { DB, uid } from '../db'
import { C, Ring, Pill, Btn, Stat, Empty, FullLoad, Modal, scoreColor } from './UI'
import { JobForm } from './JobForm'
import { CandidateDetail } from './CandidateDetail'
import { AccountMenu } from './AccountMenu'

export function RecruiterApp({ onBack, session, onLogout }) {
  const [view, setView]       = useState('dashboard')
  const [jobs, setJobs]       = useState([])
  const [cands, setCands]     = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState(null)
  const [selCand, setSelCand] = useState(null)
  const [filterJob, setFilterJob] = useState('all')
  const [filterRec, setFilterRec] = useState('all')
  const [sortBy, setSortBy]   = useState('score')
  const [search, setSearch]   = useState('')

  const load = useCallback(() => {
    setJobs(DB.getJobs())
    setCands(DB.getCandidates())
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  // ── Stats ──
  const avgScore = cands.length ? Math.round(cands.reduce((a, c) => a + c.score, 0) / cands.length) : 0
  const topCount = cands.filter(c => c.score >= 80).length
  const counts   = cands.reduce((acc, c) => { acc[c.jobId] = (acc[c.jobId] || 0) + 1; return acc }, {})

  // ── CRUD ──
  function createJob(f) { DB.addJob({ id: uid(), ...f, createdAt: new Date().toISOString() }); load(); setModal(null) }
  function updateJob(f) { DB.updateJob(f.id, f); load(); setModal(null) }
  function delJob(id)   { if (!confirm('Delete job and all its applications?')) return; DB.deleteJob(id); load(); setModal(null) }
  function toggleJob(job) { DB.updateJob(job.id, { status: job.status === 'active' ? 'closed' : 'active' }); load() }

  function candStatus(id, st) { DB.updateCandidate(id, { status: st }); load(); setSelCand(p => p ? { ...p, status: st } : p) }
  function delCand(id)   { if (!confirm('Delete this application?')) return; DB.deleteCandidate(id); load(); setSelCand(null) }

  // ── Filtered candidates ──
  const filtered = cands
    .filter(c => filterJob === 'all' || c.jobId === filterJob)
    .filter(c => filterRec === 'all' || c.recommendation === filterRec)
    .filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortBy === 'score' ? b.score - a.score : new Date(b.timestamp) - new Date(a.timestamp))

  const nav = [
    { id: 'dashboard', icon: '⬡', label: 'Dashboard' },
    { id: 'jobs',      icon: '⬢', label: 'Jobs',         n: jobs.length },
    { id: 'candidates',icon: '◈', label: 'Applications', n: cands.length },
  ]

  if (loading) return <FullLoad msg="Loading database…" />

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>

      {/* ── Sidebar ── */}
      <div style={{ width: 210, background: '#040912', borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '18px 18px 14px', borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 17, color: C.text, fontWeight: 700 }}>ResumeAI</div>
            <AccountMenu session={session} onLogout={onLogout} />
          </div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: C.muted }}>👋 {session?.name}</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: '#10b981', letterSpacing: 2, textTransform: 'uppercase', marginTop: 2 }}>Recruiter</div>
        </div>
        <nav style={{ flex: 1, padding: '14px 8px' }}>
          {nav.map(n => (
            <button key={n.id} onClick={() => setView(n.id)} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
              padding: '8px 11px', borderRadius: 7, cursor: 'pointer', marginBottom: 3,
              background: view === n.id ? '#071828' : 'transparent',
              border: `1px solid ${view === n.id ? C.accentDim : 'transparent'}`,
              color: view === n.id ? C.accent : C.muted,
              fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: 0.8,
              textTransform: 'uppercase', textAlign: 'left', transition: 'all .15s',
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>{n.icon} {n.label}</span>
              {n.n > 0 && <span style={{ background: C.faint, borderRadius: 10, padding: '1px 6px', fontSize: 9, color: C.muted }}>{n.n}</span>}
            </button>
          ))}
        </nav>
        <div style={{ padding: '14px 18px', borderTop: `1px solid ${C.border}` }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#2d3748', cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase' }}>← Exit</button>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 28px 48px' }}>

        {/* DASHBOARD */}
        {view === 'dashboard' && (
          <div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, color: C.text, margin: '0 0 4px' }}>Overview</h1>
            <p style={{ fontFamily: "'DM Sans', sans-serif", color: C.muted, fontSize: 13, marginBottom: 24 }}>Live recruitment intelligence</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 28 }}>
              <Stat label="Total Jobs"    value={jobs.length}  sub={`${jobs.filter(j => j.status === 'active').length} active`} />
              <Stat label="Applications" value={cands.length} sub="all time"        col="#3b82f6" />
              <Stat label="Avg Score"    value={avgScore || '—'} sub="all candidates" col={scoreColor(avgScore)} />
              <Stat label="Top Picks"    value={topCount}     sub="score ≥ 80"      col="#10b981" />
            </div>

            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: C.muted, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 }}>Recent Applications</div>
            {cands.length === 0 ? <Empty icon="📭" msg="No applications yet" /> :
              [...cands].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5).map(c => {
                const job = jobs.find(j => j.id === c.jobId)
                return (
                  <div key={c.id} onClick={() => setSelCand(c)} style={{ display: 'flex', alignItems: 'center', gap: 14, background: C.surface, border: `1px solid ${C.faint}`, borderRadius: 10, padding: '11px 15px', marginBottom: 7, cursor: 'pointer', transition: 'border-color .15s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = C.accentDim}
                    onMouseLeave={e => e.currentTarget.style.borderColor = C.faint}>
                    <Ring score={c.score} size={42} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: C.text, fontWeight: 600 }}>{c.name}</div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: C.muted }}>{job?.title || '—'} · {new Date(c.timestamp).toLocaleDateString()}</div>
                    </div>
                    <Pill label={c.recommendation} rec />
                  </div>
                )
              })
            }

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '24px 0 12px' }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: C.muted, letterSpacing: 3, textTransform: 'uppercase' }}>Active Jobs</div>
              <Btn sm onClick={() => { setView('jobs'); setModal({ type: 'new' }) }}>+ New Job</Btn>
            </div>
            {jobs.filter(j => j.status === 'active').length === 0
              ? <Empty icon="📋" msg="No active jobs — create one to start receiving applications" />
              : jobs.filter(j => j.status === 'active').map(j => (
                <div key={j.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: C.surface, border: `1px solid ${C.faint}`, borderRadius: 10, padding: '11px 15px', marginBottom: 7 }}>
                  <div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: C.text, fontWeight: 600 }}>{j.title}</div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: C.muted }}>{j.company} · {j.location || 'Remote'}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: C.muted }}>{counts[j.id] || 0} applicants</span>
                    <Pill label={j.type} />
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* JOBS */}
        {view === 'jobs' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div>
                <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, color: C.text, margin: '0 0 4px' }}>Job Postings</h1>
                <p style={{ fontFamily: "'DM Sans', sans-serif", color: C.muted, fontSize: 13, margin: 0 }}>Manage open positions</p>
              </div>
              <Btn onClick={() => setModal({ type: 'new' })}>+ New Job</Btn>
            </div>
            {jobs.length === 0 ? <Empty icon="📋" msg="No jobs yet. Create your first posting." /> :
              jobs.map(job => (
                <div key={job.id} style={{ background: C.surface, border: `1px solid ${C.faint}`, borderRadius: 12, padding: '18px 22px', marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, marginBottom: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 3 }}>
                        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 17, color: C.text, fontWeight: 600 }}>{job.title}</div>
                        <Pill label={job.status} />
                      </div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: C.muted, marginBottom: 8 }}>{job.company} · {job.location || '—'} · {job.type} {job.department && `· ${job.department}`}</div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>{job.description?.slice(0, 160)}…</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 26, color: C.accent, fontWeight: 700 }}>{counts[job.id] || 0}</div>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: C.muted, letterSpacing: 2, textTransform: 'uppercase' }}>applicants</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 7, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
                    <Btn sm onClick={() => setModal({ type: 'edit', data: job })}>Edit</Btn>
                    <Btn sm variant="secondary" onClick={() => toggleJob(job)}>{job.status === 'active' ? 'Close' : 'Reactivate'}</Btn>
                    <Btn sm onClick={() => { setFilterJob(job.id); setView('candidates') }}>View Applicants</Btn>
                    <Btn sm danger onClick={() => delJob(job.id)}>Delete</Btn>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* CANDIDATES */}
        {view === 'candidates' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
              <div>
                <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, color: C.text, margin: '0 0 4px' }}>Applications</h1>
                <p style={{ fontFamily: "'DM Sans', sans-serif", color: C.muted, fontSize: 13, margin: 0 }}>{filtered.length} of {cands.length} shown</p>
              </div>
            </div>
            {/* Filters */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or email…"
                style={{ flex: 1, minWidth: 160, background: '#070d1a', border: `1px solid ${C.faint}`, borderRadius: 8, padding: '8px 13px', color: C.text, fontFamily: "'DM Sans', sans-serif", fontSize: 13, outline: 'none' }} />
              {[
                { val: filterJob, set: setFilterJob, opts: [{ v: 'all', l: 'All Jobs' }, ...jobs.map(j => ({ v: j.id, l: j.title }))] },
                { val: filterRec, set: setFilterRec, opts: [{ v: 'all', l: 'All Ratings' }, ...['Highly Recommended', 'Recommended', 'Consider', 'Pass'].map(r => ({ v: r, l: r }))] },
                { val: sortBy, set: setSortBy, opts: [{ v: 'score', l: 'Score ↓' }, { v: 'date', l: 'Newest' }] },
              ].map((sel, i) => (
                <select key={i} value={sel.val} onChange={e => sel.set(e.target.value)}
                  style={{ background: '#070d1a', border: `1px solid ${C.faint}`, borderRadius: 8, padding: '8px 11px', color: '#94a3b8', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, outline: 'none' }}>
                  {sel.opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                </select>
              ))}
            </div>
            {filtered.length === 0 ? <Empty icon="🔍" msg="No applications match your filters" /> :
              filtered.map((c, i) => {
                const job = jobs.find(j => j.id === c.jobId)
                return (
                  <div key={c.id} onClick={() => setSelCand(c)} style={{ display: 'flex', alignItems: 'center', gap: 14, background: C.surface, border: `1px solid ${C.faint}`, borderRadius: 10, padding: '12px 16px', marginBottom: 7, cursor: 'pointer', transition: 'all .15s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#0c1830'; e.currentTarget.style.borderColor = C.accentDim }}
                    onMouseLeave={e => { e.currentTarget.style.background = C.surface; e.currentTarget.style.borderColor = C.faint }}>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: C.muted, width: 22, textAlign: 'center' }}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                    </div>
                    <Ring score={c.score} size={50} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: C.text, fontWeight: 600 }}>{c.name}</div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: C.muted }}>{c.email || '—'} · {job?.title || '—'}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
                      {c.status && c.status !== 'New' && <Pill label={c.status} />}
                      <Pill label={c.recommendation} rec />
                    </div>
                  </div>
                )
              })}
          </div>
        )}
      </div>

      {/* Modals */}
      {modal?.type === 'new'  && <Modal title="Post New Job" onClose={() => setModal(null)} w={700}><JobForm onSave={createJob} onCancel={() => setModal(null)} /></Modal>}
      {modal?.type === 'edit' && <Modal title="Edit Job"     onClose={() => setModal(null)} w={700}><JobForm init={modal.data} onSave={updateJob} onCancel={() => setModal(null)} /></Modal>}
      {selCand && <CandidateDetail c={selCand} jobs={jobs} onClose={() => setSelCand(null)} onStatus={st => candStatus(selCand.id, st)} onDelete={() => delCand(selCand.id)} />}
    </div>
  )
}
