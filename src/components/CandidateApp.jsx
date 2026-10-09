import { useState, useEffect } from 'react'
import { DB, uid } from '../db'
import { analyzeResume } from '../api'
import { C, Ring, Pill, Btn, Field, Empty, FullLoad, scoreColor } from './UI'
import { AccountMenu } from './AccountMenu'

export function CandidateApp({ onBack, session, onLogout }) {
  const [view, setView]         = useState('jobs')
  const [jobs, setJobs]         = useState([])
  const [selJob, setSelJob]     = useState(null)
  const [loading, setLoading]   = useState(true)
  const [submitting, setSubmit] = useState(false)
  const [error, setError]       = useState('')
  const [myApps, setMyApps]     = useState([])
  const [result, setResult]     = useState(null)
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [resume, setResume]     = useState('')
  const [fileName, setFileName] = useState('')

  useEffect(() => {
    setJobs(DB.getJobs().filter(j => j.status === 'active'))
    setLoading(false)
    // Pre-fill from session
    if (session) { setName(session.name || ''); setEmail(session.email || '') }
  }, [])

  async function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    setFileName(file.name)
    const text = await new Promise((res, rej) => {
      const r = new FileReader()
      r.onload = () => res(r.result)
      r.onerror = rej
      r.readAsText(file)
    })
    setResume(text)
  }

  async function submit() {
    if (!name || !resume || !selJob) return
    setSubmit(true); setError('')
    try {
      const jd = `${selJob.title}\n\n${selJob.description}\n\nRequirements:\n${selJob.requirements}`
      const analysis = await analyzeResume(jd, resume)
      const cand = { id: uid(), jobId: selJob.id, name: name.trim(), email: email.trim(), resumeText: resume, timestamp: new Date().toISOString(), status: 'New', ...analysis }
      DB.addCandidate(cand)
      setResult(cand)
      setMyApps(p => [...p, cand])
      setView('result')
    } catch (e) {
      setError(e.message || 'Analysis failed. Check your GROQ API key in .env file.')
    }
    setSubmit(false)
  }

  if (loading) return <FullLoad msg="Loading open positions…" />

  return (
    <div style={{ minHeight: '100vh', maxWidth: 740, margin: '0 auto', padding: '28px 22px 60px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: C.accent, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 4 }}>Candidate Portal</div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 26, color: C.text, margin: 0 }}>Find Your <span style={{ color: C.accent }}>Match</span></h1>
          {session && <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: C.muted, marginTop: 4 }}>👋 {session.name}</div>}
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {view !== 'jobs' && <Btn sm variant="secondary" onClick={() => { setView('jobs'); setResult(null) }}>← Jobs</Btn>}
          <AccountMenu session={session} onLogout={onLogout} />
        </div>
      </div>

      {/* JOB LIST */}
      {view === 'jobs' && (
        <div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", color: C.muted, fontSize: 13, marginBottom: 18 }}>{jobs.length} open position{jobs.length !== 1 ? 's' : ''}</div>
          {jobs.length === 0 ? <Empty icon="🔍" msg="No open positions right now. Check back later." /> :
            jobs.map(job => (
              <div key={job.id} style={{ background: C.surface, border: `1px solid ${C.faint}`, borderRadius: 14, padding: '22px 26px', marginBottom: 12, cursor: 'pointer', transition: 'all .2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.faint;  e.currentTarget.style.transform = 'translateY(0)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, color: C.text, fontWeight: 600, marginBottom: 3 }}>{job.title}</div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: C.muted }}>{job.company} · {job.location || 'Remote'} · {job.type}</div>
                  </div>
                  <Pill label={job.department || job.type} />
                </div>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#64748b', lineHeight: 1.6, margin: '0 0 14px' }}>{job.description?.slice(0, 200)}…</p>
                <Btn onClick={() => { setSelJob(job); setView('apply') }}>Apply Now →</Btn>
              </div>
            ))
          }
          {myApps.length > 0 && (
            <button onClick={() => setView('history')} style={{ marginTop: 8, width: '100%', background: 'transparent', border: `1px dashed ${C.faint}`, borderRadius: 10, padding: 12, color: C.muted, cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase' }}>
              My Applications ({myApps.length})
            </button>
          )}
        </div>
      )}

      {/* APPLY FORM */}
      {view === 'apply' && selJob && (
        <div>
          <div style={{ background: '#071828', border: `1px solid ${C.accentDim}`, borderRadius: 12, padding: '14px 18px', marginBottom: 20 }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: C.accent, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 3 }}>Applying for</div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 17, color: C.text, fontWeight: 600 }}>{selJob.title}</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: C.muted }}>{selJob.company}</div>
          </div>

          {error && <div style={{ background: '#150505', border: '1px solid #7f1d1d', borderRadius: 8, padding: 12, color: '#f87171', fontFamily: "'DM Sans', sans-serif", fontSize: 13, marginBottom: 14 }}>{error}</div>}

          <Field label="Full Name *" value={name} onChange={setName} placeholder="Your full name" />
          <Field label="Email" value={email} onChange={setEmail} placeholder="your@email.com" type="email" />

          {/* File Drop Zone */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: C.accent, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 6 }}>Resume / CV *</div>
            <div style={{ border: `2px dashed ${C.faint}`, borderRadius: 10, padding: '20px', textAlign: 'center', marginBottom: 10, transition: 'border-color .2s' }}
              onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = C.accent }}
              onDragLeave={e => e.currentTarget.style.borderColor = C.faint}
              onDrop={async e => {
                e.preventDefault(); e.currentTarget.style.borderColor = C.faint
                const file = e.dataTransfer.files[0]
                if (file) {
                  setFileName(file.name)
                  const text = await new Promise((r, j) => { const rd = new FileReader(); rd.onload = () => r(rd.result); rd.onerror = j; rd.readAsText(file) })
                  setResume(text)
                }
              }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>📎</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", color: C.muted, fontSize: 13, marginBottom: 10 }}>
                {fileName ? <span style={{ color: C.accent }}>{fileName}</span> : 'Drag & drop your resume (.txt, .md)'}
              </div>
              <label style={{ background: C.surface, border: `1px solid ${C.faint}`, borderRadius: 6, padding: '6px 16px', color: '#94a3b8', cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>
                Browse File
                <input type="file" accept=".txt,.md,.rtf" onChange={handleFile} style={{ display: 'none' }} />
              </label>
            </div>
            <Field label="Or paste resume text" value={resume} onChange={setResume} multi rows={9} placeholder="Paste your full resume here…" />
          </div>

          <Btn full onClick={submit} disabled={submitting || !name || !resume}>
            {submitting ? '⟳ Analyzing with Groq AI…' : 'Submit Application →'}
          </Btn>
        </div>
      )}

      {/* RESULT */}
      {view === 'result' && result && (
        <div style={{ animation: 'fadeUp .5s ease' }}>
          <div style={{ background: C.surface, border: `1px solid ${C.faint}`, borderRadius: 20, padding: '36px 28px', textAlign: 'center', marginBottom: 18 }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: C.muted, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 14 }}>Your Match Score</div>
            <Ring score={result.score} size={130} />
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 26, color: scoreColor(result.score), marginTop: 14, fontWeight: 700 }}>Grade: {result.grade}</div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", color: '#94a3b8', fontSize: 14, maxWidth: 460, margin: '10px auto 18px', lineHeight: 1.6 }}>{result.summary}</p>
            <Pill label={result.recommendation} rec />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
            <div style={{ background: '#051510', border: '1px solid #065f46', borderRadius: 12, padding: 20 }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: '#10b981', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>Strengths</div>
              {(result.strengths || []).map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 7, marginBottom: 7 }}>
                  <span style={{ color: '#10b981', fontSize: 11 }}>✓</span>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#6ee7b7' }}>{s}</span>
                </div>
              ))}
            </div>
            <div style={{ background: '#150505', border: '1px solid #7f1d1d', borderRadius: 12, padding: 20 }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: '#f87171', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>Areas to Grow</div>
              {(result.gaps || []).map((g, i) => (
                <div key={i} style={{ display: 'flex', gap: 7, marginBottom: 7 }}>
                  <span style={{ color: '#f87171', fontSize: 11 }}>↑</span>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#fca5a5' }}>{g}</span>
                </div>
              ))}
            </div>
          </div>

          {result.skills?.length > 0 && (
            <div style={{ background: C.surface, border: `1px solid ${C.faint}`, borderRadius: 12, padding: 18, marginBottom: 16 }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: C.muted, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>Skills Detected</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {result.skills.map(s => <span key={s} style={{ background: '#071828', border: `1px solid ${C.accentDim}`, borderRadius: 4, padding: '3px 10px', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: C.accent }}>{s}</span>)}
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Btn variant="secondary" full onClick={() => { setResult(null); setName(''); setEmail(''); setResume(''); setFileName(''); setView('jobs') }}>Apply to Another</Btn>
            <Btn full onClick={() => setView('history')}>My Applications</Btn>
          </div>
        </div>
      )}

      {/* HISTORY */}
      {view === 'history' && (
        <div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, color: C.text, marginBottom: 18 }}>My Applications</h2>
          {myApps.length === 0 ? <Empty icon="📭" msg="No applications yet" /> :
            myApps.map(a => {
              const job = jobs.find(j => j.id === a.jobId)
              return (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 14, background: C.surface, border: `1px solid ${C.faint}`, borderRadius: 10, padding: '12px 16px', marginBottom: 8 }}>
                  <Ring score={a.score} size={50} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: C.text, fontWeight: 600 }}>{job?.title || 'Unknown Job'}</div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: C.muted }}>{new Date(a.timestamp).toLocaleDateString()}</div>
                  </div>
                  <Pill label={a.recommendation} rec />
                </div>
              )
            })}
        </div>
      )}
    </div>
  )
}
