import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { Badge, Avatar, timeAgo } from '../utils/helpers.jsx'
import { Bug, CheckCircle, Clock, AlertTriangle, TrendingUp, Users, Plus, ArrowRight } from 'lucide-react'

const PRIORITY_COLORS = { low: '#10b981', medium: '#f59e0b', high: '#f97316', critical: '#ef4444' }

const StatCard = ({ label, value, icon: Icon, color, sub }) => (
  <div className="stat-card">
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: '#8899b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={16} color={color} />
      </div>
    </div>
    <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 32, fontWeight: 800, color: '#e8edf5', lineHeight: 1 }}>{value ?? '—'}</div>
    {sub && <div style={{ fontSize: 12, color: '#4a5f85' }}>{sub}</div>}
  </div>
)

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard/stats').then(r => setData(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <div style={{ width: 36, height: 36, border: '3px solid #1e2d4a', borderTopColor: '#4f7cff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  const { stats = {}, issuesByPriority = [], recentIssues = [], topAssignees = [] } = data || {}

  const priorityData = issuesByPriority.map(d => ({
    name: d._id, value: d.count,
    color: PRIORITY_COLORS[d._id] || '#8899b8'
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 26, fontWeight: 800, color: '#e8edf5', margin: 0, letterSpacing: '-0.02em' }}>Dashboard</h1>
          <p style={{ color: '#8899b8', fontSize: 14, margin: '4px 0 0' }}>
            Welcome back, <strong style={{ color: '#e8edf5' }}>{user?.name}</strong>
          </p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/issues/new')} style={{ cursor: 'pointer' }}>
          <Plus size={16} /> New Issue
        </button>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 16 }}>
        <StatCard label="Total Issues"    value={stats.totalIssues}       icon={Bug}           color="#4f7cff" />
        <StatCard label="Open"            value={stats.openIssues}        icon={Clock}         color="#8899b8" />
        <StatCard label="In Progress"     value={stats.inProgressIssues}  icon={TrendingUp}    color="#4f7cff" />
        <StatCard label="Resolved"        value={stats.resolvedIssues}    icon={CheckCircle}   color="#10b981" />
        <StatCard label="High Priority"   value={stats.highPriorityIssues} icon={AlertTriangle} color="#f97316" />
        <StatCard label="Critical"        value={stats.criticalIssues}    icon={AlertTriangle} color="#ef4444" />
        {user?.role === 'ADMIN' && (
          <StatCard label="Total Users" value={stats.totalUsers} icon={Users} color="#8b5cf6" sub={`${stats.activeUsers} active`} />
        )}
      </div>

      {/* Charts + Recent */}
      <div style={{ display: 'grid', gridTemplateColumns: user?.role === 'ADMIN' && topAssignees.length ? '1fr 300px' : '1fr', gap: 16 }}>
        {/* Priority donut */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#8899b8', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>By Priority</h3>
            {priorityData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={120}>
                  <PieChart>
                    <Pie data={priorityData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" paddingAngle={3}>
                      {priorityData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#131c35', border: '1px solid #1e2d4a', borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                  {priorityData.map(d => (
                    <div key={d.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color }} />
                        <span style={{ color: '#8899b8', textTransform: 'capitalize' }}>{d.name}</span>
                      </div>
                      <span style={{ fontWeight: 600, color: '#e8edf5' }}>{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4a5f85', fontSize: 13 }}>No data yet</div>}
          </div>

          {/* Status breakdown */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#8899b8', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>By Status</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
              {[
                { label: 'Open',        value: stats.openIssues,        color: '#8899b8' },
                { label: 'In Progress', value: stats.inProgressIssues,  color: '#4f7cff' },
                { label: 'Resolved',    value: stats.resolvedIssues,    color: '#10b981' },
                { label: 'Closed',      value: stats.closedIssues,      color: '#6b7280' },
              ].map(({ label, value, color }) => {
                const total = stats.totalIssues || 1
                const pct = Math.round(((value || 0) / total) * 100)
                return (
                  <div key={label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                      <span style={{ color: '#8899b8' }}>{label}</span>
                      <span style={{ fontWeight: 600, color: '#e8edf5' }}>{value || 0}</span>
                    </div>
                    <div style={{ height: 4, background: '#1e2d4a', borderRadius: 2 }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 2, transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Top assignees - admin only */}
        {user?.role === 'ADMIN' && topAssignees.length > 0 && (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e2d4a' }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#8899b8', margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Top Assignees</h3>
            </div>
            {topAssignees.map((a, i) => (
              <div key={i} style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: i < topAssignees.length - 1 ? '1px solid #1e2d4a' : 'none' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#4a5f85', width: 20, textAlign: 'center' }}>#{i + 1}</span>
                <Avatar name={a.user?.name} size={30} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#e8edf5' }}>{a.user?.name}</div>
                  <div style={{ fontSize: 11, color: '#4a5f85' }}>{a.user?.role?.toLowerCase()}</div>
                </div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 700, color: '#4f7cff' }}>{a.issueCount}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent issues */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e2d4a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#8899b8', margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Recent Issues</h3>
          <button onClick={() => navigate('/issues')} style={{ background: 'none', border: 'none', color: '#4f7cff', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
            View all <ArrowRight size={12} />
          </button>
        </div>
        {recentIssues.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: '#4a5f85', fontSize: 13 }}>
            No issues yet.{' '}
            <span style={{ color: '#4f7cff', cursor: 'pointer' }} onClick={() => navigate('/issues/new')}>Create one →</span>
          </div>
        ) : recentIssues.map(issue => (
          <div key={issue.id} onClick={() => navigate(`/issues/${issue.id}`)} className="table-row"
            style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#e8edf5', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{issue.title}</div>
              <div style={{ fontSize: 11, color: '#4a5f85', marginTop: 2 }}>#{issue.issueNumber} · {timeAgo(issue.createdAt)}</div>
            </div>
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              <Badge type="priority" value={issue.priority} />
              <Badge type="status" value={issue.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
