import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { Badge, Avatar, timeAgo, formatDate, getErrorMessage } from '../utils/helpers.jsx'
import toast from 'react-hot-toast'
import {
  ArrowLeft, Edit2, Trash2, Send, X, Check,
  UserPlus, Tag, Clock, ChevronRight, AlertTriangle
} from 'lucide-react'

const WORKFLOW = [
  { status:'OPEN',        label:'Open',        color:'#8899b8', desc:'Issue reported, awaiting assignment' },
  { status:'IN_PROGRESS', label:'In Progress',  color:'#4f7cff', desc:'Being actively worked on' },
  { status:'RESOLVED',    label:'Resolved',     color:'#10b981', desc:'Fix applied, pending verification' },
  { status:'CLOSED',      label:'Closed',       color:'#6b7280', desc:'Verified and completed' },
]

const statusIndex = (s) => WORKFLOW.findIndex(w => w.status === s)

export default function IssueDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [issue, setIssue] = useState(null)
  const [loading, setLoading] = useState(true)
  const [comment, setComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [developers, setDevelopers] = useState([])
  const [showAssign, setShowAssign] = useState(false)
  const [tab, setTab] = useState('comments')
  const [savingEdit, setSavingEdit] = useState(false)

  const fetchIssue = useCallback(async () => {
    try {
      const { data } = await api.get(`/issues/${id}`)
      setIssue(data.issue)
      setEditForm({
        title:       data.issue.title,
        description: data.issue.description,
        priority:    data.issue.priority,
        type:        data.issue.type,
        tags:        data.issue.tags?.join(', ') || '',
        dueDate:     data.issue.dueDate ? data.issue.dueDate.slice(0,10) : ''
      })
    } catch { navigate('/issues') }
    finally { setLoading(false) }
  }, [id, navigate])

  useEffect(() => { fetchIssue() }, [fetchIssue])

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      api.get('/users/developers').then(r => setDevelopers(r.data.developers || []))
    }
  }, [user])

  const handleStatusChange = async (status) => {
    try {
      const { data } = await api.put(`/issues/${id}/status`, { status })
      setIssue(data.issue)
      toast.success(`Status → ${WORKFLOW.find(w=>w.status===status)?.label}`)
    } catch (err) { toast.error(getErrorMessage(err)) }
  }

  const handleAssign = async (assigneeId) => {
    try {
      const { data } = await api.put(`/issues/${id}/assign`, { assigneeId })
      setIssue(data.issue)
      setShowAssign(false)
      toast.success(assigneeId ? 'Issue assigned!' : 'Assignment cleared')
    } catch (err) { toast.error(getErrorMessage(err)) }
  }

  const handleDelete = async () => {
    if (!window.confirm('Permanently delete this issue? This cannot be undone.')) return
    try {
      await api.delete(`/issues/${id}`)
      toast.success('Issue deleted')
      navigate('/issues')
    } catch (err) { toast.error(getErrorMessage(err)) }
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    if (!editForm.title?.trim()) { toast.error('Title is required'); return }
    if (!editForm.description?.trim()) { toast.error('Description is required'); return }
    setSavingEdit(true)
    try {
      const payload = {
        ...editForm,
        tags: editForm.tags ? editForm.tags.split(',').map(t=>t.trim()).filter(Boolean) : [],
        dueDate: editForm.dueDate ? new Date(editForm.dueDate).toISOString() : null
      }
      const { data } = await api.put(`/issues/${id}`, payload)
      setIssue(data.issue)
      setEditing(false)
      toast.success('Issue updated!')
    } catch (err) { toast.error(getErrorMessage(err)) }
    finally { setSavingEdit(false) }
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!comment.trim()) return
    setSubmittingComment(true)
    try {
      const { data } = await api.post(`/issues/${id}/comments`, { text: comment.trim() })
      setIssue(prev => ({ ...prev, comments: data.comments }))
      setComment('')
      toast.success('Comment added')
    } catch (err) { toast.error(getErrorMessage(err)) }
    finally { setSubmittingComment(false) }
  }

  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/issues/${id}/comments/${commentId}`)
      setIssue(prev => ({ ...prev, comments: prev.comments.filter(c => c.id !== commentId) }))
    } catch (err) { toast.error(getErrorMessage(err)) }
  }

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', padding:60 }}>
      <div style={{ width:36, height:36, border:'3px solid #1e2d4a',
        borderTopColor:'#4f7cff', borderRadius:'50%',
        animation:'spin 0.8s linear infinite' }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
  if (!issue) return null

  const isAdmin    = user?.role === 'ADMIN'
  const isReporter = issue.reporter?.id === user?.id
  const isAssignee = issue.assignee?.id === user?.id
  const canEdit    = isAdmin || isReporter || isAssignee
  const canStatus  = isAdmin || isAssignee
  const curIdx     = statusIndex(issue.status)
  const isCritical = issue.priority === 'CRITICAL'
  const isHigh     = issue.priority === 'HIGH'

  const Label = ({ children }) => (
    <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#4a5f85',
      marginBottom:5, textTransform:'uppercase', letterSpacing:'0.06em' }}>
      {children}
    </label>
  )

  return (
    <div style={{ maxWidth:1100, margin:'0 auto' }}>
      {/* Back */}
      <button onClick={() => navigate('/issues')} style={{
        background:'none', border:'none', color:'#8899b8', cursor:'pointer',
        display:'flex', alignItems:'center', gap:6, fontSize:13,
        padding:0, marginBottom:20 }}>
        <ArrowLeft size={15}/> Back to Issues
      </button>

      {/* Critical/High banner */}
      {(isCritical || isHigh) && issue.status !== 'RESOLVED' && issue.status !== 'CLOSED' && (
        <div style={{
          marginBottom:16, padding:'10px 16px', borderRadius:10,
          display:'flex', alignItems:'center', gap:10, fontSize:13,
          background: isCritical ? 'rgba(239,68,68,0.08)' : 'rgba(249,115,22,0.08)',
          border: `1px solid ${isCritical ? 'rgba(239,68,68,0.3)' : 'rgba(249,115,22,0.3)'}`,
          color: isCritical ? '#ef4444' : '#f97316'
        }}>
          <AlertTriangle size={15}/>
          <strong>{isCritical ? 'Critical' : 'High'} Priority Issue</strong> —
          {isCritical ? ' Requires immediate attention.' : ' Needs prompt resolution.'}
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:20 }}>
        {/* Left panel */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

          {/* Issue header card */}
          <div className="card" style={{ padding:24 }}>
            {editing ? (
              <form onSubmit={handleEdit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
                <div>
                  <Label>Title *</Label>
                  <input className="input-field" style={{ fontSize:15, fontWeight:600 }}
                    value={editForm.title}
                    onChange={e => setEditForm(f=>({...f,title:e.target.value}))} required/>
                </div>
                <div>
                  <Label>Description *</Label>
                  <textarea className="input-field" rows={6}
                    style={{ resize:'vertical', fontFamily:'inherit', lineHeight:1.6 }}
                    value={editForm.description}
                    onChange={e => setEditForm(f=>({...f,description:e.target.value}))}/>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
                  <div>
                    <Label>Type</Label>
                    <select className="select-field" value={editForm.type}
                      onChange={e => setEditForm(f=>({...f,type:e.target.value}))}>
                      <option value="BUG">🐛 Bug</option>
                      <option value="FEATURE">✨ Feature</option>
                      <option value="TASK">✅ Task</option>
                      <option value="IMPROVEMENT">🔧 Improvement</option>
                    </select>
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <select className="select-field" value={editForm.priority}
                      onChange={e => setEditForm(f=>({...f,priority:e.target.value}))}>
                      <option value="LOW">🟢 Low</option>
                      <option value="MEDIUM">🟡 Medium</option>
                      <option value="HIGH">🟠 High</option>
                      <option value="CRITICAL">🔴 Critical</option>
                    </select>
                  </div>
                  <div>
                    <Label>Due Date</Label>
                    <input type="date" className="input-field" value={editForm.dueDate}
                      onChange={e => setEditForm(f=>({...f,dueDate:e.target.value}))}
                      style={{ colorScheme:'dark' }}/>
                  </div>
                </div>
                <div>
                  <Label>Tags</Label>
                  <input className="input-field" value={editForm.tags}
                    onChange={e => setEditForm(f=>({...f,tags:e.target.value}))}
                    placeholder="comma-separated tags"/>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button type="submit" className="btn-primary"
                    disabled={savingEdit}
                    style={{ cursor: savingEdit ? 'not-allowed' : 'pointer' }}>
                    <Check size={14}/> {savingEdit ? 'Saving…' : 'Save Changes'}
                  </button>
                  <button type="button" className="btn-secondary"
                    onClick={() => setEditing(false)} style={{ cursor:'pointer' }}>
                    <X size={14}/> Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div style={{ display:'flex', alignItems:'flex-start',
                  justifyContent:'space-between', gap:12, marginBottom:14 }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8,
                      marginBottom:8, flexWrap:'wrap' }}>
                      <span style={{ fontSize:12, fontFamily:'JetBrains Mono,monospace',
                        color:'#4a5f85', background:'#1a2540', padding:'2px 8px',
                        borderRadius:4 }}>
                        #{issue.issueNumber}
                      </span>
                      <Badge type="type"     value={issue.type}    />
                      <Badge type="priority" value={issue.priority}/>
                      <Badge type="status"   value={issue.status}  />
                    </div>
                    <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:21, fontWeight:700,
                      color:'#e8edf5', margin:0, letterSpacing:'-0.02em', lineHeight:1.35 }}>
                      {issue.title}
                    </h1>
                  </div>
                  {canEdit && (
                    <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                      <button className="btn-secondary"
                        onClick={() => setEditing(true)}
                        style={{ cursor:'pointer', padding:'6px 10px' }}>
                        <Edit2 size={13}/>
                      </button>
                      {(isAdmin || isReporter) && (
                        <button className="btn-danger"
                          onClick={handleDelete}
                          style={{ cursor:'pointer', padding:'6px 10px' }}>
                          <Trash2 size={13}/>
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <p style={{ color:'#8899b8', fontSize:14, lineHeight:1.75,
                  margin:0, whiteSpace:'pre-wrap' }}>
                  {issue.description}
                </p>
                {issue.tags?.length > 0 && (
                  <div style={{ display:'flex', gap:6, marginTop:14,
                    flexWrap:'wrap', alignItems:'center' }}>
                    <Tag size={12} color="#4a5f85"/>
                    {issue.tags.map(tag => (
                      <span key={tag} style={{ fontSize:11, padding:'2px 10px',
                        borderRadius:4, background:'#1a2540', color:'#8899b8',
                        border:'1px solid #2a3f6f' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Workflow status stepper */}
          {canStatus && (
            <div className="card" style={{ padding:20 }}>
              <Label>Issue Workflow</Label>
              <div style={{ display:'flex', alignItems:'center', marginTop:12, gap:0 }}>
                {WORKFLOW.map((w, i) => {
                  const isDone    = i < curIdx
                  const isCurrent = i === curIdx
                  const isFuture  = i > curIdx
                  return (
                    <React.Fragment key={w.status}>
                      <div style={{ flex:1, display:'flex', flexDirection:'column',
                        alignItems:'center', gap:6 }}>
                        <button
                          onClick={() => canStatus && handleStatusChange(w.status)}
                          disabled={isCurrent}
                          title={w.desc}
                          style={{
                            width:36, height:36, borderRadius:'50%', border:'none',
                            cursor: isCurrent ? 'default' : 'pointer',
                            background: isDone ? '#10b981'
                                      : isCurrent ? w.color
                                      : '#1a2540',
                            border: `2px solid ${isCurrent ? w.color : isDone ? '#10b981' : '#2a3f6f'}`,
                            color: (isDone || isCurrent) ? 'white' : '#4a5f85',
                            display:'flex', alignItems:'center', justifyContent:'center',
                            fontSize:13, fontWeight:700,
                            transition:'all 0.2s',
                            boxShadow: isCurrent ? `0 0 12px ${w.color}44` : 'none'
                          }}>
                          {isDone ? '✓' : i + 1}
                        </button>
                        <span style={{
                          fontSize:10, fontWeight:600, textAlign:'center',
                          color: isCurrent ? w.color : isDone ? '#10b981' : '#4a5f85',
                          letterSpacing:'0.04em', lineHeight:1.2
                        }}>
                          {w.label}
                        </span>
                      </div>
                      {i < WORKFLOW.length - 1 && (
                        <div style={{
                          height:2, flex:1,
                          background: i < curIdx ? '#10b981' : '#1e2d4a',
                          transition:'background 0.3s', marginBottom:20
                        }}/>
                      )}
                    </React.Fragment>
                  )
                })}
              </div>
              <p style={{ fontSize:11, color:'#4a5f85', textAlign:'center', margin:'10px 0 0' }}>
                {WORKFLOW[curIdx]?.desc}
              </p>
            </div>
          )}

          {/* Comments / History tabs */}
          <div className="card" style={{ overflow:'hidden' }}>
            <div style={{ display:'flex', borderBottom:'1px solid #1e2d4a' }}>
              {['comments','history'].map(t => (
                <button key={t} onClick={() => setTab(t)} style={{
                  padding:'12px 20px', background:'none', border:'none',
                  cursor:'pointer', fontSize:13, fontWeight:600,
                  textTransform:'capitalize',
                  color: tab===t ? '#4f7cff' : '#8899b8',
                  borderBottom: tab===t ? '2px solid #4f7cff' : '2px solid transparent',
                  marginBottom:-1
                }}>
                  {t} ({t==='comments' ? issue.comments?.length||0 : issue.history?.length||0})
                </button>
              ))}
            </div>

            <div style={{ padding:20 }}>
              {tab === 'comments' && (
                <>
                  {(issue.comments?.length||0) === 0 && (
                    <p style={{ color:'#4a5f85', fontSize:13, margin:'0 0 20px' }}>
                      No comments yet — be the first to comment!
                    </p>
                  )}
                  <div style={{ display:'flex', flexDirection:'column', gap:16, marginBottom:20 }}>
                    {issue.comments?.map(c => (
                      <div key={c.id} style={{ display:'flex', gap:12 }}>
                        <Avatar name={c.user?.name} size={32}/>
                        <div style={{ flex:1 }}>
                          <div style={{ display:'flex', alignItems:'center',
                            justifyContent:'space-between', marginBottom:6 }}>
                            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                              <span style={{ fontSize:13, fontWeight:600,
                                color:'#e8edf5' }}>{c.user?.name}</span>
                              <span style={{ fontSize:11, color:'#4a5f85' }}>
                                {timeAgo(c.createdAt)}
                              </span>
                            </div>
                            {(c.user?.id===user?.id || isAdmin) && (
                              <button onClick={() => handleDeleteComment(c.id)} style={{
                                background:'none', border:'none', color:'#4a5f85',
                                cursor:'pointer', padding:4,
                                borderRadius:4, transition:'color 0.15s' }}
                                onMouseEnter={e => e.currentTarget.style.color='#ef4444'}
                                onMouseLeave={e => e.currentTarget.style.color='#4a5f85'}>
                                <X size={13}/>
                              </button>
                            )}
                          </div>
                          <div style={{ fontSize:13, color:'#8899b8', lineHeight:1.65,
                            background:'#0f1629', padding:'10px 14px', borderRadius:8,
                            border:'1px solid #1e2d4a', whiteSpace:'pre-wrap' }}>
                            {c.text}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Comment box */}
                  <form onSubmit={handleComment}
                    style={{ display:'flex', gap:10, alignItems:'flex-end' }}>
                    <Avatar name={user?.name} size={32}/>
                    <div style={{ flex:1 }}>
                      <textarea className="input-field" rows={3}
                        placeholder="Add a comment… (Ctrl+Enter to submit)"
                        style={{ resize:'none', fontFamily:'inherit', lineHeight:1.6 }}
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        onKeyDown={e => {
                          if (e.key==='Enter' && (e.metaKey||e.ctrlKey)) handleComment(e)
                        }}/>
                    </div>
                    <button type="submit" className="btn-primary"
                      disabled={!comment.trim() || submittingComment}
                      style={{
                        cursor: comment.trim() ? 'pointer' : 'not-allowed',
                        opacity: !comment.trim() ? 0.5 : 1,
                        alignSelf:'flex-end'
                      }}>
                      <Send size={14}/>
                    </button>
                  </form>
                </>
              )}

              {tab === 'history' && (
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {(issue.history?.length||0) === 0
                    ? <p style={{ color:'#4a5f85', fontSize:13, margin:0 }}>
                        No history yet.
                      </p>
                    : [...issue.history].map((h, i) => (
                      <div key={i} style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
                        <div style={{ width:8, height:8, borderRadius:'50%',
                          background:'#2a3f6f', marginTop:5, flexShrink:0 }}/>
                        <div style={{ fontSize:13, color:'#8899b8', flex:1 }}>
                          <strong style={{ color:'#e8edf5' }}>
                            {h.changedBy?.name || 'System'}
                          </strong>{' '}
                          changed{' '}
                          <strong style={{ color:'#4f7cff' }}>{h.fieldName}</strong>
                          {' from '}
                          <code style={{ fontFamily:'JetBrains Mono,monospace',
                            fontSize:11, color:'#f59e0b',
                            background:'rgba(245,158,11,0.1)',
                            padding:'1px 5px', borderRadius:3 }}>
                            {h.oldValue}
                          </code>
                          {' to '}
                          <code style={{ fontFamily:'JetBrains Mono,monospace',
                            fontSize:11, color:'#10b981',
                            background:'rgba(16,185,129,0.1)',
                            padding:'1px 5px', borderRadius:3 }}>
                            {h.newValue}
                          </code>
                          <div style={{ fontSize:11, color:'#4a5f85', marginTop:3 }}>
                            {timeAgo(h.changedAt)}
                          </div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div className="card" style={{ padding:18, display:'flex',
            flexDirection:'column', gap:16 }}>

            {/* Reporter */}
            <div>
              <Label>Reporter</Label>
              <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                <Avatar name={issue.reporter?.name} size={30}/>
                <div>
                  <div style={{ fontSize:13, fontWeight:500, color:'#e8edf5' }}>
                    {issue.reporter?.name}
                  </div>
                  <div style={{ fontSize:11, color:'#4a5f85' }}>
                    {issue.reporter?.email}
                  </div>
                </div>
              </div>
            </div>

            {/* Assignee */}
            <div>
              <div style={{ display:'flex', alignItems:'center',
                justifyContent:'space-between', marginBottom:6 }}>
                <Label>Assignee</Label>
                {isAdmin && (
                  <button onClick={() => setShowAssign(v=>!v)} style={{
                    background:'none', border:'none', color:'#4f7cff',
                    cursor:'pointer', fontSize:11,
                    display:'flex', alignItems:'center', gap:3 }}>
                    <UserPlus size={12}/>
                    {showAssign ? 'Cancel' : 'Assign'}
                  </button>
                )}
              </div>
              {issue.assignee ? (
                <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                  <Avatar name={issue.assignee.name} size={30}/>
                  <div>
                    <div style={{ fontSize:13, fontWeight:500, color:'#e8edf5' }}>
                      {issue.assignee.name}
                    </div>
                    <div style={{ fontSize:11, color:'#4a5f85', textTransform:'capitalize' }}>
                      {issue.assignee.role?.toLowerCase()}
                    </div>
                  </div>
                </div>
              ) : (
                <span style={{ fontSize:13, color:'#4a5f85' }}>Unassigned</span>
              )}

              {/* Assign panel */}
              {showAssign && isAdmin && (
                <div style={{ marginTop:10, display:'flex', flexDirection:'column', gap:4 }}>
                  <button onClick={() => handleAssign(null)} style={{
                    textAlign:'left', padding:'7px 10px', borderRadius:6,
                    background:'none', border:'1px solid rgba(239,68,68,0.3)',
                    color:'#ef4444', fontSize:12, cursor:'pointer' }}>
                    ✕ Remove assignment
                  </button>
                  {developers.map(dev => (
                    <button key={dev.id} onClick={() => handleAssign(dev.id)} style={{
                      display:'flex', alignItems:'center', gap:8,
                      textAlign:'left', padding:'7px 10px', borderRadius:6,
                      background: issue.assignee?.id===dev.id ? '#1e3a8a' : 'none',
                      border: `1px solid ${issue.assignee?.id===dev.id ? '#4f7cff' : '#1e2d4a'}`,
                      color:'#e8edf5', fontSize:12, cursor:'pointer',
                      transition:'border-color 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor='#4f7cff'}
                      onMouseLeave={e => {
                        if (issue.assignee?.id!==dev.id)
                          e.currentTarget.style.borderColor='#1e2d4a'
                      }}>
                      <Avatar name={dev.name} size={20}/>
                      <div>
                        <div style={{ fontWeight:500 }}>{dev.name}</div>
                        <div style={{ fontSize:10, color:'#4a5f85' }}>
                          {dev.assignedIssuesCount} assigned
                        </div>
                      </div>
                      {issue.assignee?.id===dev.id && (
                        <Check size={12} color="#4f7cff" style={{ marginLeft:'auto' }}/>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div style={{ height:1, background:'#1e2d4a' }}/>

            {/* Meta info */}
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {[
                { label:'Created',  value: formatDate(issue.createdAt) },
                { label:'Updated',  value: timeAgo(issue.updatedAt) },
                ...(issue.dueDate   ? [{ label:'Due Date',  value: formatDate(issue.dueDate), icon: Clock }] : []),
                ...(issue.resolvedAt ? [{ label:'Resolved', value: formatDate(issue.resolvedAt) }] : []),
                ...(issue.closedAt   ? [{ label:'Closed',   value: formatDate(issue.closedAt)   }] : []),
              ].map(({ label, value, icon:Icon }) => (
                <div key={label} style={{ display:'flex',
                  justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:11, fontWeight:600, color:'#4a5f85',
                    textTransform:'uppercase', letterSpacing:'0.05em',
                    display:'flex', alignItems:'center', gap:4 }}>
                    {Icon && <Icon size={11}/>} {label}
                  </span>
                  <span style={{ fontSize:12, color:'#8899b8' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
