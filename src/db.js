// ─── Local Storage Database ──────────────────────────────────────────────────
// Replaces window.storage (Claude artifact) with localStorage for standalone use

const KEYS = {
  JOBS: 'rsi_jobs',
  CANDIDATES: 'rsi_candidates',
}

function read(key) {
  try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] }
}
function write(key, data) {
  localStorage.setItem(key, JSON.stringify(data))
}

export const DB = {
  getJobs:       () => read(KEYS.JOBS),
  setJobs:       (j) => write(KEYS.JOBS, j),
  getCandidates: () => read(KEYS.CANDIDATES),
  setCandidates: (c) => write(KEYS.CANDIDATES, c),

  addJob(job) {
    const jobs = DB.getJobs()
    jobs.push(job)
    DB.setJobs(jobs)
  },
  updateJob(id, patch) {
    const jobs = DB.getJobs()
    const i = jobs.findIndex(j => j.id === id)
    if (i !== -1) { jobs[i] = { ...jobs[i], ...patch }; DB.setJobs(jobs) }
  },
  deleteJob(id) {
    DB.setJobs(DB.getJobs().filter(j => j.id !== id))
    DB.setCandidates(DB.getCandidates().filter(c => c.jobId !== id))
  },

  addCandidate(c) {
    const all = DB.getCandidates()
    all.push(c)
    DB.setCandidates(all)
  },
  updateCandidate(id, patch) {
    const all = DB.getCandidates()
    const i = all.findIndex(c => c.id === id)
    if (i !== -1) { all[i] = { ...all[i], ...patch }; DB.setCandidates(all) }
  },
  deleteCandidate(id) {
    DB.setCandidates(DB.getCandidates().filter(c => c.id !== id))
  },
}

export const uid = () => `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
