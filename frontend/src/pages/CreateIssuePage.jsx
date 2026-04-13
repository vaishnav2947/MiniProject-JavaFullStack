import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { getErrorMessage } from '../utils/helpers.jsx'
import { ArrowLeft, Send } from 'lucide-react'

export default function CreateIssuePage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: '', description: '', priority: 'MEDIUM', type: 'BUG', tags: '', dueDate: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.description.trim()) { toast.error('Title and description are required.'); return }
    setLoading(true)
    try {
      const payload = {
        title: form.title, description: form.description,
        priority: form.priority, type: form.type,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null
      }
      const { data } = await api.post('/issues', payload)
      toast.success('Issue created!')
      navigate(`/issues/${data.issue.id}`)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally { setLoading(false) }
  }

  const Label = ({ children }) => (
    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#8899b8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{children}</label>
  )

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#8899b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, padding: 0, marginBottom: 16 }}>
          <ArrowLeft size={15} /> Back
        </button>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 800, color: '#e8edf5', margin: 0, letterSpacing: '-0.02em' }}>Create Issue</h1>
        <p style={{ color: '#8899b8', fontSize: 13, margin: '4px 0 0' }}>Report a new bug, task, or feature request</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <Label>Title *</Label>
            <input className="input-field" placeholder="Short, descriptive issue title…" required
              value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div>
            <Label>Description *</Label>
            <textarea className="input-field" placeholder="Describe the issue in detail…" required rows={7}
              style={{ resize: 'vertical', minHeight: 140, fontFamily: 'inherit', lineHeight: 1.6 }}
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div>
              <Label>Type</Label>
              <select className="select-field" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                <option value="BUG">🐛 Bug</option>
                <option value="FEATURE">✨ Feature</option>
                <option value="TASK">✅ Task</option>
                <option value="IMPROVEMENT">🔧 Improvement</option>
              </select>
            </div>
            <div>
              <Label>Priority</Label>
              <select className="select-field" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
            <div>
              <Label>Due Date</Label>
              <input type="date" className="input-field" value={form.dueDate}
                onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} style={{ colorScheme: 'dark' }} />
            </div>
          </div>
          <div>
            <Label>Tags</Label>
            <input className="input-field" placeholder="frontend, auth, performance (comma-separated)"
              value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button type="button" className="btn-secondary" onClick={() => navigate(-1)} style={{ cursor: 'pointer' }}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={loading} style={{ cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            <Send size={14} /> {loading ? 'Creating…' : 'Create Issue'}
          </button>
        </div>
      </form>
    </div>
  )
}
