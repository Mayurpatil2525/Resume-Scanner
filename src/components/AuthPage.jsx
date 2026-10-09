import { useState } from 'react'
import { Auth } from '../auth'
import { C, Btn, Field, Spinner } from './UI'

// ─── Eye icon for password toggle ────────────────────────────────────────────
function EyeIcon({ open }) {
  return open
    ? <svg width={16} height={16} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx={12} cy={12} r={3}/></svg>
    : <svg width={16} height={16} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1={1} y1={1} x2={23} y2={23}/></svg>
}

function PasswordInput({ label, value, onChange, placeholder }) {
  const [show, setShow] = useState(false)
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: C.accent, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 5 }}>{label}</div>
      <div style={{ position: 'relative' }}>
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder || '••••••••'}
          style={{ width: '100%', background: '#070d1a', border: `1px solid ${C.faint}`, borderRadius: 8, padding: '9px 40px 9px 13px', color: C.text, fontFamily: "'DM Sans', sans-serif", fontSize: 14, outline: 'none', boxSizing: 'border-box', transition: 'border-color .2s' }}
          onFocus={e => e.target.style.borderColor = C.accent}
          onBlur={e => e.target.style.borderColor = C.faint}
        />
        <button onClick={() => setShow(s => !s)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: C.muted, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <EyeIcon open={show} />
        </button>
      </div>
    </div>
  )
}

// ─── Role tab pill ────────────────────────────────────────────────────────────
function RoleTab({ role, active, onClick }) {
  const icons = { recruiter: '🎯', candidate: '📄' }
  return (
    <button onClick={onClick} style={{
      flex: 1, padding: '10px', borderRadius: 8, cursor: 'pointer', transition: 'all .2s',
      background: active ? (role === 'recruiter' ? '#071c12' : '#071828') : 'transparent',
      border: `1px solid ${active ? (role === 'recruiter' ? '#065f46' : C.accentDim) : C.faint}`,
      color: active ? (role === 'recruiter' ? '#10b981' : C.accent) : C.muted,
      fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700,
      letterSpacing: 0.8, textTransform: 'uppercase',
    }}>
      {icons[role]} {role}
    </button>
  )
}

// ─── Main Auth Page ───────────────────────────────────────────────────────────
export function AuthPage({ defaultRole = 'candidate', onSuccess }) {
  const [mode, setMode]         = useState('login')   // 'login' | 'register'
  const [role, setRole]         = useState(defaultRole)
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [success, setSuccess]   = useState('')

  function reset() { setName(''); setEmail(''); setPassword(''); setConfirm(''); setError(''); setSuccess('') }

  function switchMode(m) { setMode(m); reset() }
  function switchRole(r) { setRole(r); reset() }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setSuccess(''); setLoading(true)
    try {
      if (mode === 'register') {
        if (!name.trim()) throw new Error('Full name is required.')
        if (!email.trim()) throw new Error('Email is required.')
        if (password !== confirm) throw new Error('Passwords do not match.')
        await Auth.register({ name, email, password, role })
        setSuccess('Account created! You can now log in.')
        switchMode('login')
      } else {
        const session = await Auth.login({ email, password, role })
        onSuccess(session)
      }
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  const isRecruiter = role === 'recruiter'
  const accentCol   = isRecruiter ? '#10b981' : C.accent

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: C.bg }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: accentCol, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 8 }}>AI Resume Scanner</div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 36, fontWeight: 800, color: C.text, margin: 0, lineHeight: 1.1 }}>
            Resume<span style={{ color: accentCol }}>AI</span>
          </h1>
        </div>

        {/* Card */}
        <div style={{ background: '#0b1525', border: `1px solid ${C.border}`, borderRadius: 20, padding: '32px 28px' }}>

          {/* Role tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            <RoleTab role="recruiter" active={role === 'recruiter'} onClick={() => switchRole('recruiter')} />
            <RoleTab role="candidate" active={role === 'candidate'} onClick={() => switchRole('candidate')} />
          </div>

          {/* Mode switch */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 24, background: C.surface, borderRadius: 10, padding: 3 }}>
            {['login', 'register'].map(m => (
              <button key={m} onClick={() => switchMode(m)} style={{
                flex: 1, padding: '8px', borderRadius: 8, cursor: 'pointer', border: 'none',
                background: mode === m ? '#0f2040' : 'transparent',
                color: mode === m ? C.text : C.muted,
                fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700,
                letterSpacing: 1, textTransform: 'uppercase', transition: 'all .15s',
              }}>{m === 'login' ? 'Sign In' : 'Register'}</button>
            ))}
          </div>

          {/* Title */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, color: C.text, fontWeight: 700 }}>
              {mode === 'login' ? `Welcome back` : `Create account`}
            </div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: C.muted, marginTop: 4 }}>
              {mode === 'login'
                ? `Sign in as ${role}`
                : `Register as ${role}`}
            </div>
          </div>

          {/* Default creds hint for recruiter login */}
          {mode === 'login' && isRecruiter && (
            <div style={{ background: '#071c12', border: '1px solid #065f46', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#10b981', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>Default Admin Account</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#6ee7b7' }}>Email: <b>admin@recruiter.com</b></div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#6ee7b7' }}>Password: <b>Admin@123</b></div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <Field label="Full Name *" value={name} onChange={setName} placeholder="Your full name" />
            )}
            <Field label="Email *" value={email} onChange={setEmail} placeholder={isRecruiter ? 'recruiter@company.com' : 'student@college.edu'} type="email" />
            <PasswordInput label="Password *" value={password} onChange={setPassword} />
            {mode === 'register' && (
              <PasswordInput label="Confirm Password *" value={confirm} onChange={setConfirm} placeholder="Re-enter password" />
            )}

            {error && (
              <div style={{ background: '#150505', border: '1px solid #7f1d1d', borderRadius: 8, padding: '10px 14px', marginBottom: 14, color: '#f87171', fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>
                ⚠ {error}
              </div>
            )}
            {success && (
              <div style={{ background: '#051510', border: '1px solid #065f46', borderRadius: 8, padding: '10px 14px', marginBottom: 14, color: '#6ee7b7', fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>
                ✓ {success}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', background: loading ? '#1a1a1a' : accentCol,
              color: loading ? '#334155' : (isRecruiter ? '#000' : '#fff'),
              border: 'none', borderRadius: 10, padding: '12px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 700,
              letterSpacing: 1, textTransform: 'uppercase',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              marginTop: 4, transition: 'all .15s',
            }}>
              {loading ? <><Spinner size={14} color="#475569" /> Processing…</> : (mode === 'login' ? 'Sign In →' : 'Create Account →')}
            </button>
          </form>

          {/* Switch mode link */}
          <div style={{ textAlign: 'center', marginTop: 18 }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: C.muted }}>
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            </span>
            <button onClick={() => switchMode(mode === 'login' ? 'register' : 'login')} style={{ background: 'none', border: 'none', color: accentCol, cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 700, letterSpacing: 0.8 }}>
              {mode === 'login' ? 'Register' : 'Sign In'}
            </button>
          </div>
        </div>

        {/* Back link */}
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button onClick={() => onSuccess(null)} style={{ background: 'none', border: 'none', color: '#2d3748', cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: 1, textTransform: 'uppercase' }}>
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}
