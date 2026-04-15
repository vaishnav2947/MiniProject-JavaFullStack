import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { getErrorMessage } from '../utils/helpers.jsx'
import { Zap, Mail, Lock, User, Briefcase, Eye, EyeOff } from 'lucide-react'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'REPORTER', department: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      await register(form)
      toast.success('Account created!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const Label = ({ children }) => (
    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#8899b8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{children}</label>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,124,255,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg, #4f7cff, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: '0 0 40px rgba(79,124,255,0.25)' }}>
            <Zap size={26} color="white" fill="white" />
          </div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 26, fontWeight: 800, color: '#e8edf5', margin: 0, letterSpacing: '-0.03em' }}>Create Account</h1>
          <p style={{ color: '#8899b8', fontSize: 13, marginTop: 5 }}>Join IssueTracker to start tracking</p>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <Label>Full Name</Label>
              <div style={{ position: 'relative' }}>
                <User size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#4a5f85', pointerEvents: 'none' }} />
                <input type="text" required className="input-field" style={{ paddingLeft: 36 }} placeholder="John Doe"
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>Email</Label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#4a5f85', pointerEvents: 'none' }} />
                <input type="email" required className="input-field" style={{ paddingLeft: 36 }} placeholder="you@example.com"
                  value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>Password</Label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#4a5f85', pointerEvents: 'none' }} />
                <input type={showPw ? 'text' : 'password'} required className="input-field" style={{ paddingLeft: 36, paddingRight: 40 }} placeholder="Min 6 characters"
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                <button type="button" onClick={() => setShowPw(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#4a5f85', cursor: 'pointer', padding: 0 }}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <Label>Role</Label>
                <select className="select-field" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                  <option value="REPORTER">Reporter</option>
                  <option value="DEVELOPER">Developer</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div>
                <Label>Department</Label>
                <div style={{ position: 'relative' }}>
                  <Briefcase size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#4a5f85', pointerEvents: 'none' }} />
                  <input type="text" className="input-field" style={{ paddingLeft: 36 }} placeholder="Engineering"
                    value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} />
                </div>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary"
              style={{ justifyContent: 'center', padding: '10px 16px', marginTop: 4, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
          <div style={{ textAlign: 'center', marginTop: 18, fontSize: 14, color: '#8899b8' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#4f7cff', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
