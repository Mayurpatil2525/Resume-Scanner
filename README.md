<<<<<<< HEAD
# Resume Intelligence — Setup Guide (VS Code)

AI-powered resume scanner · Groq API · Auth system · React + Vite

---

## Step 1 — Get a Free Groq API Key

1. Go to https://console.groq.com
2. Sign up → click **API Keys** → **Create API Key** → copy it

---

## Step 2 — Install Node.js (if not installed)

1. Go to https://nodejs.org → download **LTS** version
2. Verify in terminal:
   ```
   node --version
   npm --version
   ```

---

## Step 3 — Open in VS Code

1. Extract the `resume-scanner` folder
2. VS Code → **File → Open Folder** → select it
3. Open terminal: **Terminal → New Terminal**

---

## Step 4 — Create .env File

```bash
cp .env.example .env
```

Open `.env` and paste your key:
```
VITE_GROQ_API_KEY=gsk_your_actual_groq_key_here
```

---

## Step 5 — Install & Run

```bash
npm install
npm run dev
```

Open browser → **http://localhost:5173**

---

## Auth System

### Recruiter (default admin account)
| Field    | Value                  |
|----------|------------------------|
| Email    | admin@recruiter.com    |
| Password | Admin@123              |

> You can also register new recruiter accounts from the login screen.

### Candidate
- Click **Candidate** → **Register** → create your account
- Then log in and apply to jobs

### Features
- Passwords are hashed with SHA-256 before storing
- Sessions persist across browser refreshes
- Edit profile name, change password from avatar menu (top right)
- Logout from the avatar dropdown

---

## Project File Structure

```
resume-scanner/
├── src/
│   ├── main.jsx                    # React entry
│   ├── App.jsx                     # Root + landing + auth routing
│   ├── auth.js                     # Auth layer (register/login/session)
│   ├── db.js                       # localStorage database
│   ├── api.js                      # Groq AI API
│   └── components/
│       ├── UI.jsx                  # Design system components
│       ├── AuthPage.jsx            # Login + Register page
│       ├── AccountMenu.jsx         # Avatar dropdown (profile/logout)
│       ├── JobForm.jsx             # Create/edit job form
│       ├── CandidateDetail.jsx     # Candidate analysis modal
│       ├── RecruiterApp.jsx        # Full recruiter dashboard
│       └── CandidateApp.jsx        # Candidate portal
├── index.html
├── vite.config.js
├── package.json
├── .env                            # ← create this with your key!
└── .env.example
```

---

## Tech Stack

| Tool        | Purpose                     |
|-------------|-----------------------------|
| React 18    | UI framework                |
| Vite 5      | Dev server & bundler        |
| Groq API    | AI resume analysis (free)   |
| localStorage| Auth + database (no backend)|

## Groq Model
`llama-3.3-70b-versatile` — change in `src/api.js`
=======
# Resume-Scanner
AI-powered Resume Screening System
>>>>>>> dc5a16a0c2d7ab95027ec4e63e30bf76bc2e888e
