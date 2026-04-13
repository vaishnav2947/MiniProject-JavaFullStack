import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, Bug, Plus, Users, User, LogOut, ChevronLeft, ChevronRight, Zap } from 'lucide-react'

const navItems = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/issues',     icon: Bug,             label: 'Issues'    },
  { to: '/issues/new', icon: Plus,            label: 'New Issue' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }
  const w = collapsed ? 64 : 220

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0f1e' }}>
      <aside style={{ width: w, flexShrink: 0, background: '#0f1629', borderRight: '1px solid #1e2d4a', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 40, transition: 'width 0.25s ease', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid #1e2d4a', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #4f7cff, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Zap size={18} color="white" fill="white" />
          </div>
          {!collapsed && <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, color: '#e8edf5', letterSpacing: '-0.02em' }}>IssueFlow</span>}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === '/dashboard'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              style={collapsed ? { justifyContent: 'center' } : {}} title={collapsed ? label : ''}>
              <Icon size={18} />{!collapsed && label}
            </NavLink>
          ))}

          {user?.role === 'ADMIN' && (
            <>
              <div style={{ margin: '8px 4px 4px', fontSize: 10, letterSpacing: '0.1em', color: '#4a5f85', fontWeight: 600, textTransform: 'uppercase' }}>
                {!collapsed && 'Admin'}
              </div>
              <NavLink to="/users"
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                style={collapsed ? { justifyContent: 'center' } : {}} title={collapsed ? 'Users' : ''}>
                <Users size={18} />{!collapsed && 'Users'}
              </NavLink>
            </>
          )}
        </nav>

        {/* User section */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid #1e2d4a', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <NavLink to="/profile" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            style={collapsed ? { justifyContent: 'center' } : {}}>
            <User size={18} />
            {!collapsed && <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#e8edf5', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
              <div style={{ fontSize: 11, color: '#4a5f85', textTransform: 'capitalize' }}>{user?.role?.toLowerCase()}</div>
            </div>}
          </NavLink>
          <button onClick={handleLogout} className="sidebar-link"
            style={{ width: '100%', border: 'none', cursor: 'pointer', background: 'none', ...(collapsed ? { justifyContent: 'center' } : {}) }}>
            <LogOut size={18} style={{ color: '#ef4444' }} />
            {!collapsed && <span style={{ color: '#ef4444' }}>Logout</span>}
          </button>
        </div>

        {/* Collapse toggle */}
        <button onClick={() => setCollapsed(c => !c)} style={{ position: 'absolute', top: 22, right: -12, width: 24, height: 24, borderRadius: '50%', background: '#1a2540', border: '1px solid #2a3f6f', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#8899b8', zIndex: 10 }}>
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>

      <main style={{ marginLeft: w, flex: 1, transition: 'margin-left 0.25s ease', minHeight: '100vh' }}>
        <div style={{ flex: 1, padding: '28px 32px', maxWidth: 1400 }} className="page-enter">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
