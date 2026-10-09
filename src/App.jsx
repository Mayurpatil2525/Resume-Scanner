import { useState, useEffect } from 'react'
import { Auth, seedDefaultRecruiter } from './auth'
import { C } from './components/UI'
import { AuthPage } from './components/AuthPage'
import { RecruiterApp } from './components/RecruiterApp'
import { CandidateApp } from './components/CandidateApp'

// ─── Landing ─────────────────────────────────────────────────────────────────
function Landing({ onPortal }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 28, background: C.bg }}>
      <div style={{ textAlign: 'center', marginBottom: 52 }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: C.accent, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 10 }}>
          AI-Powered · Groq · Auth + Database
        </div>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(2.5rem,6vw,4.5rem)', fontWeight: 800, color: C.text, margin: 0, lineHeight: 1.05 }}>
          Resume<br /><span style={{ color: C.accent }}>Intelligence</span>
        </h1>
        <p style={{ fontFamily: "'DM Sans', sans-serif", color: C.muted, marginTop: 14, fontSize: 14 }}>
          Post jobs · Collect resumes · AI-ranked leaderboards · Pipeline tracking
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 580, width: '100%' }}>
        {[
          { role: 'recruiter', icon: '🎯', t: 'Recruiter', d: 'Manage job postings, view AI-ranked applicants & update pipeline status', ac: '#10b981' },
          { role: 'candidate', icon: '📄', t: 'Candidate', d: 'Browse open roles, submit your resume & get an instant AI match score', ac: C.accent },
        ].map(({ role, icon, t, d, ac }) => (
          <button key={role} onClick={() => onPortal(role)} style={{
            background: C.surface, border: `1px solid ${C.faint}`, borderRadius: 16,
            padding: '32px 26px', textAlign: 'left', cursor: 'pointer', transition: 'all .2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = ac; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 16px 36px ${ac}18` }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.faint; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}>
            <div style={{ fontSize: 34, marginBottom: 14 }}>{icon}</div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, color: C.text, fontWeight: 700, marginBottom: 7 }}>{t}</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: C.muted, lineHeight: 1.6, marginBottom: 18 }}>{d}</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: ac, letterSpacing: 2, textTransform: 'uppercase' }}>
              Sign In / Register →
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [phase, setPhase]     = useState('landing')   // 'landing' | 'auth' | 'app'
  const [authRole, setAuthRole] = useState(null)
  const [session, setSession] = useState(null)

  // Restore session on reload + seed default recruiter account
  useEffect(() => {
    seedDefaultRecruiter()
    const saved = Auth.getSession()
    if (saved) { setSession(saved); setPhase('app') }
  }, [])

  function goToAuth(role) { setAuthRole(role); setPhase('auth') }

  function handleAuthSuccess(s) {
    if (!s) { setPhase('landing'); return }  // back to home
    setSession(s)
    setPhase('app')
  }

  function handleLogout() {
    Auth.logout()
    setSession(null)
    setPhase('landing')
  }

  return (
    <div style={{ background: C.bg, minHeight: '100vh' }}>
      {phase === 'landing' && <Landing onPortal={goToAuth} />}
      {phase === 'auth'    && <AuthPage defaultRole={authRole} onSuccess={handleAuthSuccess} />}
      {phase === 'app' && session?.role === 'recruiter' && (
        <RecruiterApp session={session} onBack={() => setPhase('landing')} onLogout={handleLogout} />
      )}
      {phase === 'app' && session?.role === 'candidate' && (
        <CandidateApp session={session} onBack={() => setPhase('landing')} onLogout={handleLogout} />
      )}
    </div>
  )
}
