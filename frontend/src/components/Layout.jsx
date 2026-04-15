import React, { useState, useEffect, useRef } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import { timeAgo } from '../utils/helpers.jsx'
import {
  LayoutDashboard, Bug, Plus, Users, User, LogOut,
  ChevronLeft, ChevronRight, Zap, Bell, Check, CheckCheck, X
} from 'lucide-react'

const navItems = [
  { to:'/dashboard',  icon:LayoutDashboard, label:'Dashboard' },
  { to:'/issues',     icon:Bug,             label:'Issues'    },
  { to:'/issues/new', icon:Plus,            label:'New Issue' },
]

const typeIcon = {
  ISSUE_ASSIGNED:       '👤',
  ISSUE_STATUS_CHANGED: '🔄',
  ISSUE_COMMENTED:      '💬',
  ISSUE_CREATED:        '✨',
  ISSUE_UPDATED:        '✏️',
  ISSUE_DELETED:        '🗑️',
}

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unread, setUnread] = useState(0)
  const [showNotifs, setShowNotifs] = useState(false)
  const bellRef = useRef(null)
  const panelRef = useRef(null)

  // Poll notifications every 15 seconds
  useEffect(() => {
    const fetchNotifs = () => {
      api.get('/notifications').then(r => {
        setNotifications(r.data.notifications || [])
        setUnread(r.data.unreadCount || 0)
      }).catch(() => {})
    }
    fetchNotifs()
    const interval = setInterval(fetchNotifs, 15000)
    return () => clearInterval(interval)
  }, [])

  // Close panel on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target) &&
          bellRef.current && !bellRef.current.contains(e.target)) {
        setShowNotifs(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const markRead = async (id) => {
    await api.put(`/notifications/${id}/read`)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    setUnread(prev => Math.max(0, prev - 1))
  }

  const markAllRead = async () => {
    await api.put('/notifications/read-all')
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnread(0)
  }

  const handleNotifClick = (n) => {
    if (!n.read) markRead(n.id)
    if (n.issueId) navigate(`/issues/${n.issueId}`)
    setShowNotifs(false)
  }

  const handleLogout = () => { logout(); navigate('/login') }
  const w = collapsed ? 64 : 220

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#0a0f1e' }}>
      {/* Sidebar */}
      <aside style={{
        width:w, flexShrink:0, background:'#0f1629',
        borderRight:'1px solid #1e2d4a', position:'fixed',
        top:0, left:0, bottom:0, zIndex:40,
        transition:'width 0.25s ease', overflow:'hidden',
        display:'flex', flexDirection:'column'
      }}>
        {/* Logo */}
        <div style={{ padding:'20px 16px 16px', borderBottom:'1px solid #1e2d4a',
          display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:10,
            background:'linear-gradient(135deg,#4f7cff,#8b5cf6)',
            display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <Zap size={18} color="white" fill="white" />
          </div>
          {!collapsed && <span style={{ fontFamily:'Syne,sans-serif', fontWeight:800,
            fontSize:18, color:'#e8edf5', letterSpacing:'-0.02em' }}>IssueTracker</span>}
        </div>

        {/* Nav links */}
        <nav style={{ flex:1, padding:'12px 8px', display:'flex', flexDirection:'column', gap:2 }}>
          {navItems.map(({ to, icon:Icon, label }) => (
            <NavLink key={to} to={to} end={to==='/dashboard'}
              className={({ isActive }) => `sidebar-link ${isActive?'active':''}`}
              style={collapsed?{justifyContent:'center'}:{}} title={collapsed?label:''}>
              <Icon size={18} />{!collapsed && label}
            </NavLink>
          ))}
          {user?.role === 'ADMIN' && <>
            <div style={{ margin:'8px 4px 4px', fontSize:10, letterSpacing:'0.1em',
              color:'#4a5f85', fontWeight:600, textTransform:'uppercase' }}>
              {!collapsed && 'Admin'}
            </div>
            <NavLink to="/users"
              className={({ isActive }) => `sidebar-link ${isActive?'active':''}`}
              style={collapsed?{justifyContent:'center'}:{}} title={collapsed?'Users':''}>
              <Users size={18} />{!collapsed && 'Users'}
            </NavLink>
          </>}
        </nav>

        {/* Bottom: profile + logout */}
        <div style={{ padding:'12px 8px', borderTop:'1px solid #1e2d4a',
          display:'flex', flexDirection:'column', gap:2 }}>
          <NavLink to="/profile"
            className={({ isActive }) => `sidebar-link ${isActive?'active':''}`}
            style={collapsed?{justifyContent:'center'}:{}}>
            <User size={18} />
            {!collapsed && <div style={{ flex:1, overflow:'hidden' }}>
              <div style={{ fontSize:13, fontWeight:600, color:'#e8edf5',
                whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                {user?.name}
              </div>
              <div style={{ fontSize:11, color:'#4a5f85', textTransform:'capitalize' }}>
                {user?.role?.toLowerCase()}
              </div>
            </div>}
          </NavLink>
          <button onClick={handleLogout} className="sidebar-link"
            style={{ width:'100%', border:'none', cursor:'pointer', background:'none',
              ...(collapsed?{justifyContent:'center'}:{}) }}>
            <LogOut size={18} style={{ color:'#ef4444' }} />
            {!collapsed && <span style={{ color:'#ef4444' }}>Sign Out</span>}
          </button>
        </div>

        {/* Collapse toggle */}
        <button onClick={() => setCollapsed(c => !c)} style={{
          position:'absolute', top:22, right:-12, width:24, height:24,
          borderRadius:'50%', background:'#1a2540', border:'1px solid #2a3f6f',
          display:'flex', alignItems:'center', justifyContent:'center',
          cursor:'pointer', color:'#8899b8', zIndex:10 }}>
          {collapsed ? <ChevronRight size={12}/> : <ChevronLeft size={12}/>}
        </button>
      </aside>

      {/* Main content */}
      <main style={{ marginLeft:w, flex:1, transition:'margin-left 0.25s ease', minHeight:'100vh' }}>
        {/* Top bar with notification bell */}
        <div style={{
          position:'sticky', top:0, zIndex:30,
          background:'rgba(10,15,30,0.95)', backdropFilter:'blur(10px)',
          borderBottom:'1px solid #1e2d4a',
          display:'flex', alignItems:'center', justifyContent:'flex-end',
          padding:'10px 28px', gap:12
        }}>
          {/* Notification Bell */}
          <div style={{ position:'relative' }}>
            <button ref={bellRef} onClick={() => setShowNotifs(v => !v)} style={{
              position:'relative', background:'none', border:'none',
              color:'#8899b8', cursor:'pointer', padding:8, borderRadius:8,
              transition:'all 0.2s',
              ...(showNotifs ? { background:'#1a2540', color:'#4f7cff' } : {})
            }}>
              <Bell size={20} />
              {unread > 0 && (
                <span style={{
                  position:'absolute', top:4, right:4,
                  width:18, height:18, borderRadius:'50%',
                  background:'#ef4444', color:'white',
                  fontSize:10, fontWeight:700,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  border:'2px solid #0a0f1e'
                }}>
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </button>

            {/* Notification Panel */}
            {showNotifs && (
              <div ref={panelRef} style={{
                position:'absolute', top:'calc(100% + 8px)', right:0,
                width:380, maxHeight:500, overflowY:'auto',
                background:'#0f1629', border:'1px solid #2a3f6f',
                borderRadius:14, boxShadow:'0 20px 60px rgba(0,0,0,0.5)',
                zIndex:100
              }}>
                {/* Panel header */}
                <div style={{
                  padding:'14px 16px', borderBottom:'1px solid #1e2d4a',
                  display:'flex', alignItems:'center', justifyContent:'space-between',
                  position:'sticky', top:0, background:'#0f1629', zIndex:1
                }}>
                  <div>
                    <span style={{ fontWeight:700, color:'#e8edf5', fontSize:14 }}>
                      Notifications
                    </span>
                    {unread > 0 && (
                      <span style={{ marginLeft:8, fontSize:11, color:'#4f7cff',
                        background:'rgba(79,124,255,0.15)', padding:'1px 7px',
                        borderRadius:999 }}>
                        {unread} new
                      </span>
                    )}
                  </div>
                  <div style={{ display:'flex', gap:4 }}>
                    {unread > 0 && (
                      <button onClick={markAllRead} title="Mark all read" style={{
                        background:'none', border:'none', color:'#4f7cff',
                        cursor:'pointer', fontSize:11, display:'flex',
                        alignItems:'center', gap:4, padding:'4px 8px',
                        borderRadius:6, transition:'background 0.2s'
                      }}>
                        <CheckCheck size={13}/> All read
                      </button>
                    )}
                    <button onClick={() => setShowNotifs(false)} style={{
                      background:'none', border:'none', color:'#4a5f85',
                      cursor:'pointer', padding:4, borderRadius:6 }}>
                      <X size={14}/>
                    </button>
                  </div>
                </div>

                {/* Notification list */}
                {notifications.length === 0 ? (
                  <div style={{ padding:32, textAlign:'center', color:'#4a5f85', fontSize:13 }}>
                    <Bell size={28} style={{ opacity:0.3, display:'block', margin:'0 auto 10px' }}/>
                    No notifications yet
                  </div>
                ) : notifications.map(n => (
                  <div key={n.id} onClick={() => handleNotifClick(n)} style={{
                    padding:'12px 16px', cursor:'pointer',
                    borderBottom:'1px solid #1a2535',
                    background: n.read ? 'transparent' : 'rgba(79,124,255,0.05)',
                    transition:'background 0.15s',
                    display:'flex', gap:10, alignItems:'flex-start'
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = '#1a2540'}
                    onMouseLeave={e => e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(79,124,255,0.05)'}
                  >
                    <span style={{ fontSize:18, flexShrink:0, marginTop:1 }}>
                      {typeIcon[n.type] || '🔔'}
                    </span>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, color: n.read ? '#8899b8' : '#e8edf5',
                        lineHeight:1.4, wordBreak:'break-word' }}>
                        {n.message}
                      </div>
                      <div style={{ fontSize:11, color:'#4a5f85', marginTop:4 }}>
                        {timeAgo(n.createdAt)}
                      </div>
                    </div>
                    {!n.read && (
                      <button onClick={e => { e.stopPropagation(); markRead(n.id) }}
                        title="Mark read" style={{
                          background:'none', border:'none', color:'#4f7cff',
                          cursor:'pointer', padding:4, flexShrink:0 }}>
                        <Check size={13}/>
                      </button>
                    )}
                    {!n.read && (
                      <div style={{ width:8, height:8, borderRadius:'50%',
                        background:'#4f7cff', flexShrink:0, marginTop:5 }}/>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User avatar badge */}
          <div onClick={() => navigate('/profile')} style={{
            display:'flex', alignItems:'center', gap:8,
            cursor:'pointer', padding:'6px 10px', borderRadius:8,
            border:'1px solid #1e2d4a', transition:'all 0.2s'
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor='#4f7cff'}
            onMouseLeave={e => e.currentTarget.style.borderColor='#1e2d4a'}
          >
            <div style={{
              width:28, height:28, borderRadius:'50%',
              background:'linear-gradient(135deg,#4f7cff,#8b5cf6)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:11, fontWeight:700, color:'white'
            }}>
              {(user?.name || '?').charAt(0).toUpperCase()}
            </div>
            <div style={{ fontSize:12 }}>
              <div style={{ color:'#e8edf5', fontWeight:600 }}>{user?.name}</div>
              <div style={{ color:'#4a5f85', textTransform:'capitalize', fontSize:10 }}>
                {user?.role?.toLowerCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div style={{ padding:'24px 28px', maxWidth:1400 }} className="page-enter">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
