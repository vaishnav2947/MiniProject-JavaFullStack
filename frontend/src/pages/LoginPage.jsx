import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { getErrorMessage } from '../utils/helpers.jsx'
import { Zap, Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email:'', password:'' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [attempts, setAttempts] = useState(0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (attempts >= 5) {
      toast.error('Too many failed attempts. Please wait a moment.')
      return
    }
    if (!form.email || !form.password) {
      toast.error('Email and password are required.')
      return
    }
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Signed in successfully!')
      navigate('/dashboard')
    } catch (err) {
      setAttempts(a => a + 1)
      toast.error(getErrorMessage(err) || 'Invalid email or password.')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight:'100vh', background:'#0a0f1e', display:'flex',
      alignItems:'center', justifyContent:'center', padding:16,
      position:'relative', overflow:'hidden' }}>
      {/* BG glows */}
      <div style={{ position:'absolute', top:'-20%', left:'-10%', width:600, height:600,
        borderRadius:'50%', background:'radial-gradient(circle,rgba(79,124,255,0.08) 0%,transparent 70%)',
        pointerEvents:'none' }}/>
      <div style={{ position:'absolute', bottom:'-20%', right:'-10%', width:500, height:500,
        borderRadius:'50%', background:'radial-gradient(circle,rgba(139,92,246,0.06) 0%,transparent 70%)',
        pointerEvents:'none' }}/>

      <div style={{ width:'100%', maxWidth:400, position:'relative', zIndex:1 }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ width:60, height:60, borderRadius:18,
            background:'linear-gradient(135deg,#4f7cff,#8b5cf6)',
            display:'flex', alignItems:'center', justifyContent:'center',
            margin:'0 auto 16px', boxShadow:'0 0 40px rgba(79,124,255,0.35)' }}>
            <Zap size={30} color="white" fill="white"/>
          </div>
          <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:30, fontWeight:800,
            color:'#e8edf5', margin:0, letterSpacing:'-0.03em' }}>IssueTracker</h1>
          <p style={{ color:'#8899b8', fontSize:14, marginTop:6 }}>
            Sign in to your workspace
          </p>
        </div>

        <div className="card" style={{ padding:28 }}>
          <form onSubmit={handleSubmit} noValidate
            style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:600,
                color:'#8899b8', marginBottom:6, textTransform:'uppercase',
                letterSpacing:'0.06em' }}>Email Address</label>
              <div style={{ position:'relative' }}>
                <Mail size={15} style={{ position:'absolute', left:12, top:'50%',
                  transform:'translateY(-50%)', color:'#4a5f85', pointerEvents:'none' }}/>
                <input type="email" required autoComplete="email"
                  className="input-field" style={{ paddingLeft:36 }}
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm(f=>({...f,email:e.target.value}))} />
              </div>
            </div>

            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:600,
                color:'#8899b8', marginBottom:6, textTransform:'uppercase',
                letterSpacing:'0.06em' }}>Password</label>
              <div style={{ position:'relative' }}>
                <Lock size={15} style={{ position:'absolute', left:12, top:'50%',
                  transform:'translateY(-50%)', color:'#4a5f85', pointerEvents:'none' }}/>
                <input type={showPw?'text':'password'} required autoComplete="current-password"
                  className="input-field" style={{ paddingLeft:36, paddingRight:40 }}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f=>({...f,password:e.target.value}))} />
                <button type="button" onClick={() => setShowPw(v=>!v)} style={{
                  position:'absolute', right:12, top:'50%', transform:'translateY(-50%)',
                  background:'none', border:'none', color:'#4a5f85', cursor:'pointer', padding:0 }}>
                  {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
            </div>

            {attempts >= 3 && (
              <div style={{ padding:'8px 12px', borderRadius:8, fontSize:12,
                background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.3)',
                color:'#f59e0b' }}>
                ⚠️ {5 - attempts} attempt{5-attempts!==1?'s':''} remaining before lockout.
              </div>
            )}

            <button type="submit" disabled={loading || attempts >= 5}
              className="btn-primary"
              style={{ justifyContent:'center', padding:'11px 16px', marginTop:4,
                opacity: (loading || attempts>=5) ? 0.7 : 1,
                cursor: (loading || attempts>=5) ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div style={{ textAlign:'center', marginTop:20, fontSize:14, color:'#8899b8' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color:'#4f7cff', textDecoration:'none',
              fontWeight:600 }}>Create account</Link>
          </div>
        </div>

        {/* Security badge */}
        <div style={{ textAlign:'center', marginTop:16, display:'flex',
          alignItems:'center', justifyContent:'center', gap:6,
          fontSize:11, color:'#4a5f85' }}>
          <ShieldCheck size={13}/>
          Secured with JWT · BCrypt · HTTPS-ready
        </div>

        <div style={{ textAlign:'center', marginTop:8, fontSize:11, color:'#4a5f85' }}>
          Default admin:{' '}
          <strong style={{ color:'#8899b8', fontFamily:'JetBrains Mono,monospace' }}>
            admin@issueflow.com
          </strong>
          {' / '}
          <strong style={{ color:'#8899b8', fontFamily:'JetBrains Mono,monospace' }}>
            admin123
          </strong>
        </div>
      </div>
    </div>
  )
}
