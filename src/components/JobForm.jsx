import { useState } from 'react'
import { C, Btn, Field } from './UI'

export function JobForm({ init = {}, onSave, onCancel }) {
  const [f, setF] = useState({
    title: '', company: '', location: '', type: 'Full-time',
    department: '', description: '', requirements: '', status: 'active',
    ...init,
  })
  const set = k => v => setF(x => ({ ...x, [k]: v }))

  const SelectField = ({ label, field, opts }) => (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: C.accent, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 5 }}>{label}</div>
      <select value={f[field]} onChange={e => set(field)(e.target.value)}
        style={{ width: '100%', background: '#070d1a', border: `1px solid ${C.faint}`, borderRadius: 8, padding: '9px 13px', color: C.text, fontFamily: "'DM Sans', sans-serif", fontSize: 14, outline: 'none' }}>
        {opts.map(o => <option key={o.value || o} value={o.value || o}>{o.label || o}</option>)}
      </select>
    </div>
  )

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Field label="Job Title *" value={f.title} onChange={set('title')} placeholder="e.g. Senior React Developer" />
        <Field label="Company *" value={f.company} onChange={set('company')} placeholder="Company name" />
        <Field label="Location" value={f.location} onChange={set('location')} placeholder="Remote / City, Country" />
        <SelectField label="Type" field="type" opts={['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance']} />
        <Field label="Department" value={f.department} onChange={set('department')} placeholder="Engineering / Design…" />
        <SelectField label="Status" field="status" opts={[
          { value: 'active', label: 'Active (visible to candidates)' },
          { value: 'draft',  label: 'Draft (hidden)' },
          { value: 'closed', label: 'Closed' },
        ]} />
      </div>
      <Field label="Job Description *" value={f.description} onChange={set('description')} multi rows={7} placeholder="Role overview, responsibilities, day-to-day duties…" />
      <Field label="Requirements & Skills *" value={f.requirements} onChange={set('requirements')} multi rows={5} placeholder="Must-have qualifications, skills, years of experience…" />
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <Btn variant="secondary" onClick={onCancel}>Cancel</Btn>
        <Btn onClick={() => onSave(f)} disabled={!f.title || !f.company || !f.description}>
          {init?.id ? 'Update Job' : 'Create Job'}
        </Btn>
      </div>
    </div>
  )
}
