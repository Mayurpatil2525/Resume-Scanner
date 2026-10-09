import { useState } from 'react'
import { Auth } from '../auth'
import { C, Btn, Field } from './UI'

function initials(name = '') {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }} onClick={onClose}>
      <div style={{ background: '#0b1525', border: `1px solid ${C.border}`, borderRadius: 16, width: '100%', maxWidth: 420, padding: 28 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, color: C.text, fontWeight: 600 }}>{title}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 22 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function AccountMenu({ session, onLogout }) {
  const [open, setOpen]         = useState(false)
  const [modal, setModal]       = useState(null)  // 'profile' | 'password'
  const [name, setName]         = useState(session.name)
  const [oldPw, setOldPw]       = useState('')
  const [newPw, setNewPw]       = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [msg, setMsg]           = useState('')
  const [err, setErr]           = useState('')

  const isRecruiter = session.role === 'recruiter'
  const color       = isRecruiter ? '#10b981' : C.accent

  async function saveName() {
    setErr(''); setMsg('')
    if (!name.trim()) { setErr('Name cannot be empty.'); return }
    Auth.updateUser(session.userId, { name: name.trim() })
    session.name = name.trim()
    localStorage.setItem('rsi_session', JSON.stringify(session))
    setMsg('Name updated successfully!')
  }

  async function savePassword() {
    setErr(''); setMsg('')
    if (newPw !== confirmPw) { setErr('Passwords do not match.'); return }
    try {
      await Auth.changePassword(session.userId, oldPw, newPw)
      setMsg('Password changed!'); setOldPw(''); setNewPw(''); setConfirmPw('')
    } catch (e) { setErr(e.message) }
  }

  function closeModal() { setModal(null); setMsg(''); setErr('') }

  return (
    <>
      {/* Avatar Button */}
      <div style={{ position: 'relative' }}>
        <button onClick={() => setOpen(o => !o)} style={{
          width: 34, height: 34, borderRadius: '50%', background: isRecruiter ? '#071c12' : '#071828',
          border: `2px solid ${color}`, color, cursor: 'pointer', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700,
        }}>
          {initials(session.name)}
        </button>

        {/* Dropdown */}
        {open && (
          <div style={{ position: 'absolute', right: 0, top: 42, background: '#0b1525', border: `1px solid ${C.border}`, borderRadius: 12, width: 220, padding: '8px', zIndex: 500, boxShadow: '0 8px 32px rgba(0,0,0,.5)' }}
            onClick={() => setOpen(false)}>
            {/* User info */}
            <div style={{ padding: '8px 12px 10px', borderBottom: `1px solid ${C.faint}`, marginBottom: 6 }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: C.text, fontWeight: 600 }}>{session.name}</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: C.muted }}>{session.email}</div>
              <div style={{ marginTop: 4 }}>
                <span style={{ background: isRecruiter ? '#071c12' : '#071828', border: `1px solid ${isRecruiter ? '#065f46' : C.accentDim}`, borderRadius: 4, padding: '1px 7px', fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color, letterSpacing: 1, textTransform: 'uppercase' }}>
                  {session.role}
                </span>
              </div>
            </div>

            {[
              { label: '👤 Edit Profile',      action: () => setModal('profile')  },
              { label: '🔑 Change Password',   action: () => setModal('password') },
              { label: '🚪 Sign Out',           action: onLogout, danger: true     },
            ].map(item => (
              <button key={item.label} onClick={item.action} style={{
                display: 'block', width: '100%', padding: '8px 12px', borderRadius: 7,
                background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left',
                fontFamily: "'DM Sans', sans-serif", fontSize: 13,
                color: item.danger ? '#f87171' : C.text, transition: 'background .15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = C.surface}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Profile Modal */}
      {modal === 'profile' && (
        <Modal title="Edit Profile" onClose={closeModal}>
          <Field label="Full Name" value={name} onChange={setName} placeholder="Your name" />
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: C.muted, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 5 }}>Email</div>
          <div style={{ background: '#070d1a', border: `1px solid ${C.faint}`, borderRadius: 8, padding: '9px 13px', color: C.muted, fontFamily: "'DM Sans', sans-serif", fontSize: 14, marginBottom: 14 }}>{session.email}</div>
          {err  && <div style={{ color: '#f87171', fontFamily: "'DM Sans', sans-serif", fontSize: 13, marginBottom: 10 }}>⚠ {err}</div>}
          {msg  && <div style={{ color: '#6ee7b7', fontFamily: "'DM Sans', sans-serif", fontSize: 13, marginBottom: 10 }}>✓ {msg}</div>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Btn variant="secondary" onClick={closeModal}>Cancel</Btn>
            <Btn onClick={saveName}>Save Changes</Btn>
          </div>
        </Modal>
      )}

      {/* Password Modal */}
      {modal === 'password' && (
        <Modal title="Change Password" onClose={closeModal}>
          {[
            { label: 'Current Password', val: oldPw, set: setOldPw },
            { label: 'New Password',     val: newPw, set: setNewPw },
            { label: 'Confirm New',      val: confirmPw, set: setConfirmPw },
          ].map(({ label, val, set }) => (
            <div key={label} style={{ marginBottom: 14 }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: C.accent, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 5 }}>{label}</div>
              <input type="password" value={val} onChange={e => set(e.target.value)} placeholder="••••••••"
                style={{ width: '100%', background: '#070d1a', border: `1px solid ${C.faint}`, borderRadius: 8, padding: '9px 13px', color: C.text, fontFamily: "'DM Sans', sans-serif", fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = C.accent}
                onBlur={e => e.target.style.borderColor = C.faint} />
            </div>
          ))}
          {err && <div style={{ color: '#f87171', fontFamily: "'DM Sans', sans-serif", fontSize: 13, marginBottom: 10 }}>⚠ {err}</div>}
          {msg && <div style={{ color: '#6ee7b7', fontFamily: "'DM Sans', sans-serif", fontSize: 13, marginBottom: 10 }}>✓ {msg}</div>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Btn variant="secondary" onClick={closeModal}>Cancel</Btn>
            <Btn onClick={savePassword}>Update Password</Btn>
          </div>
        </Modal>
      )}
    </>
  )
}
