// ─── Auth Layer ───────────────────────────────────────────────────────────────
// All users stored in localStorage under 'rsi_users'
// Sessions stored under 'rsi_session'

const USERS_KEY   = 'rsi_users'
const SESSION_KEY = 'rsi_session'

function readUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]') } catch { return [] }
}
function writeUsers(u) { localStorage.setItem(USERS_KEY, JSON.stringify(u)) }

// ── Simple hash (not cryptographic — use bcrypt on a real backend) ──
async function hashPassword(pw) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pw + '_rsi_salt'))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

// Seed a default recruiter admin if none exists
export function seedDefaultRecruiter() {
  const users = readUsers()
  const hasRecruiter = users.some(u => u.role === 'recruiter')
  if (!hasRecruiter) {
    // Default: admin / Admin@123  (hashed at runtime on first call)
    hashPassword('Admin@123').then(hash => {
      const users = readUsers()
      if (!users.some(u => u.email === 'admin@recruiter.com')) {
        users.push({
          id: 'default_admin',
          name: 'Admin Recruiter',
          email: 'admin@recruiter.com',
          passwordHash: hash,
          role: 'recruiter',
          createdAt: new Date().toISOString(),
        })
        writeUsers(users)
      }
    })
  }
}

export const Auth = {
  // ── Register ──
  async register({ name, email, password, role }) {
    const users = readUsers()
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('An account with this email already exists.')
    }
    if (password.length < 6) throw new Error('Password must be at least 6 characters.')
    const passwordHash = await hashPassword(password)
    const user = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      role,
      createdAt: new Date().toISOString(),
    }
    users.push(user)
    writeUsers(users)
    return user
  },

  // ── Login ──
  async login({ email, password, role }) {
    const users = readUsers()
    const user = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase() && u.role === role)
    if (!user) throw new Error('No account found with this email for the selected role.')
    const hash = await hashPassword(password)
    if (hash !== user.passwordHash) throw new Error('Incorrect password.')
    // Save session
    const session = { userId: user.id, name: user.name, email: user.email, role: user.role, loginAt: new Date().toISOString() }
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    return session
  },

  // ── Logout ──
  logout() { localStorage.removeItem(SESSION_KEY) },

  // ── Get current session ──
  getSession() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null') } catch { return null }
  },

  // ── Get all users (recruiter admin view) ──
  getUsers(role) {
    const users = readUsers()
    return role ? users.filter(u => u.role === role) : users
  },

  // ── Delete user ──
  deleteUser(id) {
    writeUsers(readUsers().filter(u => u.id !== id))
  },

  // ── Update user name ──
  updateUser(id, patch) {
    const users = readUsers()
    const i = users.findIndex(u => u.id === id)
    if (i !== -1) { users[i] = { ...users[i], ...patch }; writeUsers(users) }
  },

  // ── Change password ──
  async changePassword(id, oldPw, newPw) {
    const users = readUsers()
    const user = users.find(u => u.id === id)
    if (!user) throw new Error('User not found.')
    const oldHash = await hashPassword(oldPw)
    if (oldHash !== user.passwordHash) throw new Error('Current password is incorrect.')
    if (newPw.length < 6) throw new Error('New password must be at least 6 characters.')
    user.passwordHash = await hashPassword(newPw)
    writeUsers(users)
  },
}
