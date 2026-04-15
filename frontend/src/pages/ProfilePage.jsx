import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { getErrorMessage, Avatar } from '../utils/helpers.jsx'
import { User, Lock, Save, Eye, EyeOff, LogOut, ShieldCheck, Bell } from 'lucide-react'

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth()
  const navigate = useNavigate()
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '', department: user?.department || ''
  })
  const [pwForm, setPwForm] = useState({
    currentPassword:'', newPassword:'', confirmPassword:''
  })
  const [showPw, setShowPw] = useState({ cur:false, new:false, confirm:false })
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPw, setSavingPw] = useState(false)

  const handleProfile = async (e) => {
    e.preventDefault()
    if (!profileForm.name.trim()) { toast.error('Name is required'); return }
    setSavingProfile(true)
    try {
      const { data } = await api.put('/auth/profile', profileForm)
      updateUser(data.user)
      toast.success('Profile updated!')
    } catch (err) { toast.error(getErrorMessage(err)) }
    finally { setSavingProfile(false) }
  }

  const handlePassword = async (e) => {
    e.preventDefault()
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error('New passwords do not match'); return
    }
    if (pwForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters'); return
    }
    setSavingPw(true)
    try {
      await api.put('/auth/change-password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword
      })
      toast.success('Password changed successfully!')
      setPwForm({ currentPassword:'', newPassword:'', confirmPassword:'' })
    } catch (err) { toast.error(getErrorMessage(err)) }
    finally { setSavingPw(false) }
  }

  const handleSignOut = () => {
    logout()
    toast.success('Signed out successfully.')
    navigate('/login')
  }

  const roleColor = { ADMIN:'#8b5cf6', DEVELOPER:'#4f7cff', REPORTER:'#10b981' }
  const roleLabel = { ADMIN:'Admin', DEVELOPER:'Developer', REPORTER:'Reporter' }

  const Label = ({ children }) => (
    <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#8899b8',
      marginBottom:6, textTransform:'uppercase', letterSpacing:'0.06em' }}>
      {children}
    </label>
  )

  const strengthScore = (pw) => {
    let s = 0
    if (pw.length >= 8) s++
    if (/[A-Z]/.test(pw)) s++
    if (/[0-9]/.test(pw)) s++
    if (/[^A-Za-z0-9]/.test(pw)) s++
    return s
  }
  const pwStrength = strengthScore(pwForm.newPassword)
  const strengthColor = ['#ef4444','#f97316','#f59e0b','#10b981','#10b981'][pwStrength]
  const strengthLabel = ['','Weak','Fair','Good','Strong'][pwStrength]

  return (
    <div style={{ maxWidth:640, margin:'0 auto', display:'flex', flexDirection:'column', gap:20 }}>
      <div>
        <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:24, fontWeight:800,
          color:'#e8edf5', margin:0, letterSpacing:'-0.02em' }}>My Profile</h1>
        <p style={{ color:'#8899b8', fontSize:13, margin:'4px 0 0' }}>
          Manage your account settings and security
        </p>
      </div>

      {/* Avatar card */}
      <div className="card" style={{ padding:24,
        display:'flex', alignItems:'center', justifyContent:'space-between', gap:20, flexWrap:'wrap' }}>
        <div style={{ display:'flex', alignItems:'center', gap:20 }}>
          <Avatar name={user?.name} size={72}/>
          <div>
            <div style={{ fontFamily:'Syne,sans-serif', fontSize:20,
              fontWeight:700, color:'#e8edf5' }}>{user?.name}</div>
            <div style={{ fontSize:13, color:'#8899b8', marginTop:2 }}>{user?.email}</div>
            <div style={{ marginTop:8, display:'flex', gap:8, alignItems:'center' }}>
              <span style={{ fontSize:11, fontWeight:600, padding:'3px 10px',
                borderRadius:4, background:`${roleColor[user?.role]}18`,
                color:roleColor[user?.role], textTransform:'capitalize' }}>
                {roleLabel[user?.role] || user?.role?.toLowerCase()}
              </span>
              {user?.department && (
                <span style={{ fontSize:11, color:'#4a5f85' }}>
                  · {user.department}
                </span>
              )}
            </div>
          </div>
        </div>
        <button onClick={handleSignOut} style={{
          display:'flex', alignItems:'center', gap:8, padding:'9px 16px',
          borderRadius:8, background:'rgba(239,68,68,0.08)',
          border:'1px solid rgba(239,68,68,0.25)', color:'#ef4444',
          cursor:'pointer', fontSize:13, fontWeight:600,
          transition:'all 0.2s'
        }}
          onMouseEnter={e => e.currentTarget.style.background='rgba(239,68,68,0.15)'}
          onMouseLeave={e => e.currentTarget.style.background='rgba(239,68,68,0.08)'}>
          <LogOut size={15}/> Sign Out
        </button>
      </div>

      {/* Profile info */}
      <div className="card" style={{ padding:24 }}>
        <h2 style={{ fontSize:15, fontWeight:700, color:'#e8edf5',
          margin:'0 0 18px', display:'flex', alignItems:'center', gap:8 }}>
          <User size={15} color="#4f7cff"/> Profile Information
        </h2>
        <form onSubmit={handleProfile} style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div>
            <Label>Full Name</Label>
            <input className="input-field" required
              value={profileForm.name}
              onChange={e => setProfileForm(f=>({...f,name:e.target.value}))}/>
          </div>
          <div>
            <Label>Email Address</Label>
            <input className="input-field" value={user?.email} disabled
              style={{ opacity:0.5, cursor:'not-allowed' }}/>
            <div style={{ fontSize:11, color:'#4a5f85', marginTop:4 }}>
              Email cannot be changed for security reasons
            </div>
          </div>
          <div>
            <Label>Department</Label>
            <input className="input-field" placeholder="e.g. Engineering, Design, QA"
              value={profileForm.department}
              onChange={e => setProfileForm(f=>({...f,department:e.target.value}))}/>
          </div>
          <div style={{ display:'flex', justifyContent:'flex-end' }}>
            <button type="submit" className="btn-primary"
              disabled={savingProfile}
              style={{ cursor: savingProfile ? 'not-allowed' : 'pointer',
                opacity: savingProfile ? 0.7 : 1 }}>
              <Save size={14}/> {savingProfile ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Security / Password */}
      <div className="card" style={{ padding:24 }}>
        <h2 style={{ fontSize:15, fontWeight:700, color:'#e8edf5',
          margin:'0 0 4px', display:'flex', alignItems:'center', gap:8 }}>
          <Lock size={15} color="#4f7cff"/> Change Password
        </h2>
        <p style={{ fontSize:12, color:'#4a5f85', margin:'0 0 18px' }}>
          Use a strong password with letters, numbers and symbols
        </p>
        <form onSubmit={handlePassword} style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {/* Current password */}
          <div>
            <Label>Current Password</Label>
            <div style={{ position:'relative' }}>
              <input type={showPw.cur?'text':'password'}
                className="input-field" style={{ paddingRight:40 }}
                placeholder="Enter current password"
                value={pwForm.currentPassword}
                onChange={e => setPwForm(f=>({...f,currentPassword:e.target.value}))} required/>
              <button type="button"
                onClick={() => setShowPw(s=>({...s,cur:!s.cur}))} style={{
                  position:'absolute', right:12, top:'50%', transform:'translateY(-50%)',
                  background:'none', border:'none', color:'#4a5f85', cursor:'pointer', padding:0 }}>
                {showPw.cur ? <EyeOff size={15}/> : <Eye size={15}/>}
              </button>
            </div>
          </div>

          {/* New password */}
          <div>
            <Label>New Password</Label>
            <div style={{ position:'relative' }}>
              <input type={showPw.new?'text':'password'}
                className="input-field" style={{ paddingRight:40 }}
                placeholder="Min 6 characters"
                value={pwForm.newPassword}
                onChange={e => setPwForm(f=>({...f,newPassword:e.target.value}))} required/>
              <button type="button"
                onClick={() => setShowPw(s=>({...s,new:!s.new}))} style={{
                  position:'absolute', right:12, top:'50%', transform:'translateY(-50%)',
                  background:'none', border:'none', color:'#4a5f85', cursor:'pointer', padding:0 }}>
                {showPw.new ? <EyeOff size={15}/> : <Eye size={15}/>}
              </button>
            </div>
            {pwForm.newPassword && (
              <div style={{ marginTop:6, display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ flex:1, height:3, background:'#1e2d4a', borderRadius:2 }}>
                  <div style={{ height:'100%', borderRadius:2, transition:'width 0.3s',
                    width:`${(pwStrength/4)*100}%`, background:strengthColor }}/>
                </div>
                <span style={{ fontSize:11, color:strengthColor, fontWeight:600 }}>
                  {strengthLabel}
                </span>
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <Label>Confirm New Password</Label>
            <div style={{ position:'relative' }}>
              <input type={showPw.confirm?'text':'password'}
                className="input-field" style={{ paddingRight:40 }}
                placeholder="Repeat new password"
                value={pwForm.confirmPassword}
                onChange={e => setPwForm(f=>({...f,confirmPassword:e.target.value}))} required/>
              <button type="button"
                onClick={() => setShowPw(s=>({...s,confirm:!s.confirm}))} style={{
                  position:'absolute', right:12, top:'50%', transform:'translateY(-50%)',
                  background:'none', border:'none', color:'#4a5f85', cursor:'pointer', padding:0 }}>
                {showPw.confirm ? <EyeOff size={15}/> : <Eye size={15}/>}
              </button>
            </div>
            {pwForm.confirmPassword && pwForm.newPassword !== pwForm.confirmPassword && (
              <div style={{ fontSize:12, color:'#ef4444', marginTop:4 }}>
                Passwords do not match
              </div>
            )}
          </div>

          <div style={{ display:'flex', justifyContent:'flex-end' }}>
            <button type="submit" className="btn-primary"
              disabled={savingPw || (pwForm.confirmPassword && pwForm.newPassword !== pwForm.confirmPassword)}
              style={{ cursor: savingPw ? 'not-allowed' : 'pointer',
                opacity: savingPw ? 0.7 : 1 }}>
              <ShieldCheck size={14}/> {savingPw ? 'Updating…' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

      {/* Danger zone */}
      <div className="card" style={{ padding:24, border:'1px solid rgba(239,68,68,0.2)' }}>
        <h2 style={{ fontSize:15, fontWeight:700, color:'#ef4444',
          margin:'0 0 8px', display:'flex', alignItems:'center', gap:8 }}>
          <LogOut size={15}/> Sign Out
        </h2>
        <p style={{ fontSize:13, color:'#8899b8', margin:'0 0 16px' }}>
          Sign out from your account on this device. Your data will remain safe.
        </p>
        <button onClick={handleSignOut} style={{
          display:'flex', alignItems:'center', gap:8, padding:'9px 18px',
          borderRadius:8, background:'rgba(239,68,68,0.08)',
          border:'1px solid rgba(239,68,68,0.3)', color:'#ef4444',
          cursor:'pointer', fontSize:13, fontWeight:600 }}>
          <LogOut size={14}/> Sign Out of IssueFlow
        </button>
      </div>
    </div>
  )
}
