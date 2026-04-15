import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import IssuesPage from './pages/IssuesPage'
import IssueDetailPage from './pages/IssueDetailPage'
import CreateIssuePage from './pages/CreateIssuePage'
import UsersPage from './pages/UsersPage'
import ProfilePage from './pages/ProfilePage'

const Spinner = () => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
    height:'100vh', background:'#0a0f1e', flexDirection:'column', gap:12 }}>
    <div style={{ width:40, height:40, border:'3px solid #1e2d4a',
      borderTopColor:'#4f7cff', borderRadius:'50%',
      animation:'spin 0.8s linear infinite' }} />
    <p style={{ color:'#8899b8', fontSize:14 }}>Loading…</p>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
)

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />
  return children
}

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{
          style:{ background:'#131c35', color:'#e8edf5', border:'1px solid #1e2d4a', fontSize:14 },
          success:{ iconTheme:{ primary:'#10b981', secondary:'#0a0f1e' } },
          error:{ iconTheme:{ primary:'#ef4444', secondary:'#0a0f1e' } }
        }} />
        <Routes>
          <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard"  element={<DashboardPage />} />
            <Route path="issues"     element={<IssuesPage />} />
            <Route path="issues/new" element={<CreateIssuePage />} />
            <Route path="issues/:id" element={<IssueDetailPage />} />
            <Route path="users"      element={<ProtectedRoute roles={['ADMIN']}><UsersPage /></ProtectedRoute>} />
            <Route path="profile"    element={<ProfilePage />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
