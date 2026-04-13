import React, { useEffect, useState } from 'react'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { Avatar, getErrorMessage, timeAgo } from '../utils/helpers.jsx'
import { Users, Trash2, Edit2, X, Check, Search } from 'lucide-react'

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null)
  const [editForm, setEditForm] = useState({})

  useEffect(() => {
    api.get('/users').then(r => setUsers(r.data.users)).finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"?`)) return
    try {
      await api.delete(`/users/${id}`)
      setUsers(prev => prev.filter(u => u.id !== id))
      toast.success('User deleted')
    } catch (err) { toast.error(getErrorMessage(err)) }
  }

  const handleEditSave = async () => {
    try {
      const { data } = await api.put(`/users/${editing}`, editForm)
      setUsers(prev => prev.map(u => u.id === editing ? data.user : u))
      setEditing(null); toast.success('User updated')
    } catch (err) { toast.error(getErrorMessage(err)) }
  }

  const startEdit = (u) => {
    setEditing(u.id)
    setEditForm({ name: u.name, email: u.email, role: u.role, department: u.department || '', active: u.active })
  }

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )
  const roleColor = { ADMIN: '#8b5cf6', DEVELOPER: '#4f7cff', REPORTER: '#10b981' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 800, color: '#e8edf5', margin: 0, letterSpacing: '-0.02em' }}>
            <Users size={22} style={{ display: 'inline', marginRight: 10, verticalAlign: 'middle' }} />
            User Management
          </h1>
          <p style={{ color: '#8899b8', fontSize: 13, margin: '4px 0 0' }}>{users.length} registered users</p>
        </div>
      </div>

      <div style={{ position: 'relative', maxWidth: 400 }}>
        <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#4a5f85', pointerEvents: 'none' }} />
        <input className="input-field" style={{ paddingLeft: 36 }} placeholder="Search users…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <div style={{ width: 30, height: 30, border: '3px solid #1e2d4a', borderTopColor: '#4f7cff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 100px', gap: 12, padding: '10px 20px', borderBottom: '1px solid #1e2d4a' }}>
              {['User', 'Role', 'Department', 'Status', 'Joined', 'Actions'].map(h => (
                <div key={h} style={{ fontSize: 11, fontWeight: 600, color: '#4a5f85', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</div>
              ))}
            </div>
            {filtered.map(u => (
              <div key={u.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 100px', gap: 12, padding: '14px 20px', borderBottom: '1px solid #1e2d4a', alignItems: 'center' }}>
                {editing === u.id ? (
                  <>
                    <input className="input-field" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} style={{ fontSize: 12 }} />
                    <select className="select-field" style={{ fontSize: 12 }} value={editForm.role} onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))}>
                      <option value="REPORTER">Reporter</option>
                      <option value="DEVELOPER">Developer</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                    <input className="input-field" value={editForm.department} onChange={e => setEditForm(f => ({ ...f, department: e.target.value }))} placeholder="Dept" style={{ fontSize: 12 }} />
                    <select className="select-field" style={{ fontSize: 12 }} value={editForm.active} onChange={e => setEditForm(f => ({ ...f, active: e.target.value === 'true' }))}>
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                    <div />
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn-primary" onClick={handleEditSave} style={{ cursor: 'pointer', padding: '5px 8px' }}><Check size={13} /></button>
                      <button className="btn-secondary" onClick={() => setEditing(null)} style={{ cursor: 'pointer', padding: '5px 8px' }}><X size={13} /></button>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar name={u.name} size={32} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: '#e8edf5' }}>{u.name}</div>
                        <div style={{ fontSize: 11, color: '#4a5f85' }}>{u.email}</div>
                      </div>
                    </div>
                    <div><span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: `${roleColor[u.role]}18`, color: roleColor[u.role], textTransform: 'capitalize' }}>{u.role?.toLowerCase()}</span></div>
                    <div style={{ fontSize: 13, color: '#8899b8' }}>{u.department || '—'}</div>
                    <div><span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: u.active ? 'rgba(16,185,129,0.1)' : 'rgba(107,114,128,0.1)', color: u.active ? '#10b981' : '#6b7280', border: `1px solid ${u.active ? 'rgba(16,185,129,0.3)' : 'rgba(107,114,128,0.3)'}` }}>{u.active ? 'Active' : 'Inactive'}</span></div>
                    <div style={{ fontSize: 12, color: '#4a5f85' }}>{timeAgo(u.createdAt)}</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn-secondary" onClick={() => startEdit(u)} style={{ cursor: 'pointer', padding: '5px 8px' }}><Edit2 size={12} /></button>
                      <button className="btn-danger" onClick={() => handleDelete(u.id, u.name)} style={{ cursor: 'pointer', padding: '5px 8px' }}><Trash2 size={12} /></button>
                    </div>
                  </>
                )}
              </div>
            ))}
            {filtered.length === 0 && <div style={{ padding: 32, textAlign: 'center', color: '#4a5f85', fontSize: 13 }}>No users found.</div>}
          </>
        )}
      </div>
    </div>
  )
}
