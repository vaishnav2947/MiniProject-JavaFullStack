import React, { useState } from 'react'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { getErrorMessage, Avatar } from '../utils/helpers.jsx'
import { User, Lock, Save, Eye, EyeOff } from 'lucide-react'

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', department: user?.department || '' })
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [showPw, setShowPw] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPw, setSavingPw] = useState(false)

  const handleProfile = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      const { data } = await api.put('/auth/profile', profileForm)
      updateUser(data.user); toast.success('Profile updated!')
    } catch (err) { toast.error(getErrorMessage(err)) }
    finally { setSavingProfile(false) }
  }

  const handlePassword = async (e) => {
    e.preventDefault()
    if (pwForm.newPassword !== pwForm.confirmPassword) { toast.error('Passwords do not match'); return }
    if (pwForm.newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setSavingPw(true)
    try {
      await api.put('/auth/change-password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword })
      toast.success('Password changed!')
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) { toast.error(getErrorMessage(err)) }
    finally { setSavingPw(false) }
  }

  const Label = ({ children }) => (
    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#8899b8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{children}</label>
  )
  const roleColor = { ADMIN: '#8b5cf6', DEVELOPER: '#4f7cff', REPORTER: '#10b981' }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 800, color: '#e8edf5', margin: 0, letterSpacing: '-0.02em' }}>My Profile</h1>
        <p style={{ color: '#8899b8', fontSize: 13, margin: '4px 0 0' }}>Manage your account settings</p>
      </div>

      <div className="card" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
        <Avatar name={user?.name} size={72} />
        <div>
          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 700, color: '#e8edf5' }}>{user?.name}</div>
          <div style={{ fontSize: 13, color: '#8899b8', marginTop: 2 }}>{user?.email}</div>
          <div style={{ marginTop: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 4, background: `${roleColor[user?.role]}18`, color: roleColor[user?.role], textTransform: 'capitalize' }}>
              {user?.role?.toLowerCase()}
            </span>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#e8edf5', margin: '0 0 18px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <User size={16} color="#4f7cff" /> Profile Information
        </h2>
        <form onSubmit={handleProfile} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div><Label>Full Name</Label><input className="input-field" required value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))} /></div>
          <div>
            <Label>Email</Label>
            <input className="input-field" value={user?.email} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
            <div style={{ fontSize: 11, color: '#4a5f85', marginTop: 4 }}>Email cannot be changed</div>
          </div>
          <div><Label>Department</Label><input className="input-field" placeholder="e.g. Engineering" value={profileForm.department} onChange={e => setProfileForm(f => ({ ...f, department: e.target.value }))} /></div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn-primary" disabled={savingProfile} style={{ cursor: savingProfile ? 'not-allowed' : 'pointer', opacity: savingProfile ? 0.7 : 1 }}>
              <Save size={14} /> {savingProfile ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      <div className="card" style={{ padding: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#e8edf5', margin: '0 0 18px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Lock size={16} color="#4f7cff" /> Change Password
        </h2>
        <form onSubmit={handlePassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {['currentPassword', 'newPassword', 'confirmPassword'].map((field, i) => (
            <div key={field}>
              <Label>{['Current Password', 'New Password', 'Confirm New Password'][i]}</Label>
              <div style={{ position: 'relative' }}>
                <input type={showPw ? 'text' : 'password'} className="input-field" style={{ paddingRight: 40 }}
                  placeholder={['Enter current password', 'Min 6 characters', 'Repeat new password'][i]}
                  value={pwForm[field]} onChange={e => setPwForm(f => ({ ...f, [field]: e.target.value }))} required />
                {i === 0 && (
                  <button type="button" onClick={() => setShowPw(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#4a5f85', cursor: 'pointer', padding: 0 }}>
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                )}
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn-primary" disabled={savingPw} style={{ cursor: savingPw ? 'not-allowed' : 'pointer', opacity: savingPw ? 0.7 : 1 }}>
              <Lock size={14} /> {savingPw ? 'Updating…' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
