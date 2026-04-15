import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { getErrorMessage } from '../utils/helpers.jsx'
import { ArrowLeft, Send, AlertCircle } from 'lucide-react'

export default function CreateIssuePage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '', description: '', priority: 'MEDIUM',
    type: 'BUG', tags: '', dueDate: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.title.trim())       e.title = 'Title is required'
    if (form.title.trim().length > 200) e.title = 'Title must be under 200 characters'
    if (!form.description.trim()) e.description = 'Description is required'
    if (form.description.trim().length < 10) e.description = 'Description must be at least 10 characters'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    try {
      const payload = {
        title:       form.title.trim(),
        description: form.description.trim(),
        priority:    form.priority,
        type:        form.type,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null
      }
      const { data } = await api.post('/issues', payload)
      toast.success('Issue created successfully!')
      navigate(`/issues/${data.issue.id}`)
    } catch (err) {
      const msg = getErrorMessage(err)
      toast.error(msg)
      if (msg.toLowerCase().includes('title')) setErrors({ title: msg })
      else if (msg.toLowerCase().includes('description')) setErrors({ description: msg })
    } finally { setLoading(false) }
  }

  const Field = ({ label, required, error, children }) => (
    <div>
      <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#8899b8',
        marginBottom:6, textTransform:'uppercase', letterSpacing:'0.06em' }}>
        {label} {required && <span style={{ color:'#ef4444' }}>*</span>}
      </label>
      {children}
      {error && (
        <div style={{ display:'flex', alignItems:'center', gap:5, marginTop:5,
          fontSize:12, color:'#ef4444' }}>
          <AlertCircle size={12}/> {error}
        </div>
      )}
    </div>
  )

  const inputStyle = (hasError) => ({
    ...(hasError ? { borderColor:'#ef4444', boxShadow:'0 0 0 3px rgba(239,68,68,0.1)' } : {})
  })

  return (
    <div style={{ maxWidth:760, margin:'0 auto' }}>
      <div style={{ marginBottom:24 }}>
        <button onClick={() => navigate(-1)} style={{
          background:'none', border:'none', color:'#8899b8', cursor:'pointer',
          display:'flex', alignItems:'center', gap:6, fontSize:13,
          padding:0, marginBottom:16 }}>
          <ArrowLeft size={15}/> Back
        </button>
        <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:24, fontWeight:800,
          color:'#e8edf5', margin:0, letterSpacing:'-0.02em' }}>
          Create Issue
        </h1>
        <p style={{ color:'#8899b8', fontSize:13, margin:'4px 0 0' }}>
          Report a bug, request a feature, or create a task
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate style={{ display:'flex', flexDirection:'column', gap:20 }}>
        <div className="card" style={{ padding:24, display:'flex', flexDirection:'column', gap:18 }}>

          <Field label="Title" required error={errors.title}>
            <input className="input-field" style={inputStyle(errors.title)}
              placeholder="e.g. Login button not responding on mobile"
              value={form.title}
              onChange={e => { setForm(f=>({...f,title:e.target.value})); setErrors(er=>({...er,title:''})) }}
              maxLength={200} />
            <div style={{ fontSize:11, color:'#4a5f85', marginTop:4, textAlign:'right' }}>
              {form.title.length}/200
            </div>
          </Field>

          <Field label="Description" required error={errors.description}>
            <textarea className="input-field"
              style={{ resize:'vertical', minHeight:150, fontFamily:'inherit',
                lineHeight:1.7, ...inputStyle(errors.description) }}
              placeholder="Describe the issue in detail. Include:&#10;• Steps to reproduce&#10;• Expected behavior&#10;• Actual behavior&#10;• Environment (browser, OS, version)"
              value={form.description}
              onChange={e => { setForm(f=>({...f,description:e.target.value})); setErrors(er=>({...er,description:''})) }}
            />
          </Field>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16 }}>
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:600,
                color:'#8899b8', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.06em' }}>
                Type
              </label>
              <select className="select-field" value={form.type}
                onChange={e => setForm(f=>({...f,type:e.target.value}))}>
                <option value="BUG">🐛 Bug</option>
                <option value="FEATURE">✨ Feature Request</option>
                <option value="TASK">✅ Task</option>
                <option value="IMPROVEMENT">🔧 Improvement</option>
              </select>
            </div>
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:600,
                color:'#8899b8', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.06em' }}>
                Priority
              </label>
              <select className="select-field" value={form.priority}
                onChange={e => setForm(f=>({...f,priority:e.target.value}))}>
                <option value="LOW">🟢 Low</option>
                <option value="MEDIUM">🟡 Medium</option>
                <option value="HIGH">🟠 High</option>
                <option value="CRITICAL">🔴 Critical</option>
              </select>
            </div>
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:600,
                color:'#8899b8', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.06em' }}>
                Due Date
              </label>
              <input type="date" className="input-field" value={form.dueDate}
                onChange={e => setForm(f=>({...f,dueDate:e.target.value}))}
                min={new Date().toISOString().split('T')[0]}
                style={{ colorScheme:'dark' }} />
            </div>
          </div>

          <div>
            <label style={{ display:'block', fontSize:12, fontWeight:600,
              color:'#8899b8', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.06em' }}>
              Tags
            </label>
            <input className="input-field"
              placeholder="e.g. frontend, auth, mobile (comma-separated)"
              value={form.tags}
              onChange={e => setForm(f=>({...f,tags:e.target.value}))} />
          </div>

          {/* Priority indicator */}
          {(form.priority === 'HIGH' || form.priority === 'CRITICAL') && (
            <div style={{
              padding:'10px 14px', borderRadius:8, display:'flex', alignItems:'center', gap:8,
              background: form.priority === 'CRITICAL' ? 'rgba(239,68,68,0.08)' : 'rgba(249,115,22,0.08)',
              border: `1px solid ${form.priority === 'CRITICAL' ? 'rgba(239,68,68,0.3)' : 'rgba(249,115,22,0.3)'}`,
              fontSize:13,
              color: form.priority === 'CRITICAL' ? '#ef4444' : '#f97316'
            }}>
              <AlertCircle size={14}/>
              {form.priority === 'CRITICAL'
                ? 'Critical priority — this will notify all admins immediately.'
                : 'High priority — this issue will be escalated quickly.'}
            </div>
          )}
        </div>

        <div style={{ display:'flex', gap:12, justifyContent:'flex-end' }}>
          <button type="button" className="btn-secondary"
            onClick={() => navigate(-1)} style={{ cursor:'pointer' }}>
            Cancel
          </button>
          <button type="submit" className="btn-primary"
            disabled={loading}
            style={{ cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            <Send size={14}/>
            {loading ? 'Creating…' : 'Create Issue'}
          </button>
        </div>
      </form>
    </div>
  )
}
