import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar,
         ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { Badge, Avatar, timeAgo } from '../utils/helpers.jsx'
import { Bug, CheckCircle, Clock, AlertTriangle, TrendingUp,
         Users, Plus, ArrowRight, RefreshCw } from 'lucide-react'

const PC = { low:'#10b981', medium:'#f59e0b', high:'#f97316', critical:'#ef4444' }
const SC = { OPEN:'#8899b8', IN_PROGRESS:'#4f7cff', RESOLVED:'#10b981', CLOSED:'#6b7280' }

const StatCard = ({ label, value, icon:Icon, color, sub, onClick }) => (
  <div className="stat-card" onClick={onClick}
    style={{ cursor: onClick ? 'pointer' : 'default' }}>
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
      <span style={{ fontSize:11, fontWeight:600, color:'#8899b8',
        textTransform:'uppercase', letterSpacing:'0.06em' }}>{label}</span>
      <div style={{ width:32, height:32, borderRadius:8, background:`${color}18`,
        display:'flex', alignItems:'center', justifyContent:'center' }}>
        <Icon size={16} color={color}/>
      </div>
    </div>
    <div style={{ fontFamily:'Syne,sans-serif', fontSize:32, fontWeight:800,
      color:'#e8edf5', lineHeight:1 }}>{value ?? '—'}</div>
    {sub && <div style={{ fontSize:12, color:'#4a5f85' }}>{sub}</div>}
  </div>
)

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'#131c35', border:'1px solid #1e2d4a',
      borderRadius:8, padding:'8px 12px', fontSize:12 }}>
      <p style={{ color:'#8899b8', margin:'0 0 4px' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, margin:0, fontWeight:600 }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  const fetchData = useCallback(() => {
    setLoading(true)
    api.get('/dashboard/stats')
      .then(r => { setData(r.data); setLastRefresh(new Date()) })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchData() }, [fetchData])
  // Auto-refresh every 30s
  useEffect(() => {
    const t = setInterval(fetchData, 30000)
    return () => clearInterval(t)
  }, [fetchData])

  if (loading && !data) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:300 }}>
      <div style={{ width:36, height:36, border:'3px solid #1e2d4a',
        borderTopColor:'#4f7cff', borderRadius:'50%',
        animation:'spin 0.8s linear infinite' }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const { stats={}, issuesByPriority=[], issuesByType=[], recentIssues=[], topAssignees=[] } = data || {}

  const priorityData = issuesByPriority.map(d => ({
    name: d._id.charAt(0).toUpperCase() + d._id.slice(1).toLowerCase(),
    value: d.count, color: PC[d._id.toLowerCase()] || '#8899b8'
  }))

  const statusData = [
    { name:'Open',        value: stats.openIssues        || 0, color: SC.OPEN },
    { name:'In Progress', value: stats.inProgressIssues  || 0, color: SC.IN_PROGRESS },
    { name:'Resolved',    value: stats.resolvedIssues     || 0, color: SC.RESOLVED },
    { name:'Closed',      value: stats.closedIssues       || 0, color: SC.CLOSED },
  ].filter(d => d.value > 0)

  const typeData = issuesByType.map(d => ({
    name: d._id.charAt(0).toUpperCase() + d._id.slice(1).toLowerCase(),
    count: d.count
  }))

  const resolutionRate = stats.totalIssues > 0
    ? Math.round(((stats.resolvedIssues + stats.closedIssues) / stats.totalIssues) * 100)
    : 0

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
        flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:26, fontWeight:800,
            color:'#e8edf5', margin:0, letterSpacing:'-0.02em' }}>Dashboard</h1>
          <p style={{ color:'#8899b8', fontSize:13, margin:'4px 0 0' }}>
            Welcome back, <strong style={{ color:'#e8edf5' }}>{user?.name}</strong>
            <span style={{ marginLeft:12, fontSize:11, color:'#4a5f85' }}>
              Last updated {timeAgo(lastRefresh)}
            </span>
          </p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button className="btn-secondary" onClick={fetchData}
            style={{ cursor:'pointer', opacity: loading ? 0.6 : 1 }}>
            <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }}/>
            Refresh
          </button>
          <button className="btn-primary" onClick={() => navigate('/issues/new')}
            style={{ cursor:'pointer' }}>
            <Plus size={16}/> New Issue
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:14 }}>
        <StatCard label="Total"       value={stats.totalIssues}       icon={Bug}           color="#4f7cff"
          onClick={() => navigate('/issues')} />
        <StatCard label="Open"        value={stats.openIssues}        icon={Clock}         color="#8899b8"
          onClick={() => navigate('/issues?status=OPEN')} />
        <StatCard label="In Progress" value={stats.inProgressIssues}  icon={TrendingUp}    color="#4f7cff"
          onClick={() => navigate('/issues?status=IN_PROGRESS')} />
        <StatCard label="Resolved"    value={stats.resolvedIssues}    icon={CheckCircle}   color="#10b981"
          onClick={() => navigate('/issues?status=RESOLVED')} />
        <StatCard label="Critical"    value={stats.criticalIssues}    icon={AlertTriangle} color="#ef4444"
          sub="Needs immediate action"
          onClick={() => navigate('/issues?priority=CRITICAL')} />
        <StatCard label="High"        value={stats.highPriorityIssues} icon={AlertTriangle} color="#f97316"
          onClick={() => navigate('/issues?priority=HIGH')} />
        {user?.role === 'ADMIN' && (
          <StatCard label="Users" value={stats.totalUsers} icon={Users} color="#8b5cf6"
            sub={`${stats.activeUsers} active`} />
        )}
        <div className="stat-card">
          <div style={{ fontSize:11, fontWeight:600, color:'#8899b8',
            textTransform:'uppercase', letterSpacing:'0.06em' }}>Resolution Rate</div>
          <div style={{ fontFamily:'Syne,sans-serif', fontSize:32, fontWeight:800,
            color:'#10b981', lineHeight:1 }}>{resolutionRate}%</div>
          <div style={{ height:4, background:'#1e2d4a', borderRadius:2, marginTop:4 }}>
            <div style={{ height:'100%', width:`${resolutionRate}%`,
              background:'#10b981', borderRadius:2, transition:'width 1s ease' }}/>
          </div>
        </div>
      </div>

      {/* Charts row 1 */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16 }}>
        {/* Priority donut */}
        <div className="card" style={{ padding:20 }}>
          <h3 style={{ fontSize:13, fontWeight:600, color:'#8899b8', margin:'0 0 14px',
            textTransform:'uppercase', letterSpacing:'0.06em' }}>By Priority</h3>
          {priorityData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={130}>
                <PieChart>
                  <Pie data={priorityData} cx="50%" cy="50%"
                    innerRadius={38} outerRadius={55} dataKey="value" paddingAngle={3}>
                    {priorityData.map((e,i) => <Cell key={i} fill={e.color}/>)}
                  </Pie>
                  <Tooltip content={<CustomTooltip/>}/>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display:'flex', flexDirection:'column', gap:5, marginTop:6 }}>
                {priorityData.map(d => (
                  <div key={d.name} onClick={() => navigate(`/issues?priority=${d.name.toUpperCase()}`)}
                    style={{ display:'flex', justifyContent:'space-between',
                      alignItems:'center', fontSize:12, cursor:'pointer', padding:'2px 4px',
                      borderRadius:4, transition:'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background='#1a2540'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                    <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                      <div style={{ width:8, height:8, borderRadius:'50%', background:d.color }}/>
                      <span style={{ color:'#8899b8' }}>{d.name}</span>
                    </div>
                    <span style={{ fontWeight:600, color:'#e8edf5' }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : <div style={{ textAlign:'center', color:'#4a5f85', fontSize:13, padding:40 }}>No data</div>}
        </div>

        {/* Status donut */}
        <div className="card" style={{ padding:20 }}>
          <h3 style={{ fontSize:13, fontWeight:600, color:'#8899b8', margin:'0 0 14px',
            textTransform:'uppercase', letterSpacing:'0.06em' }}>By Status</h3>
          {statusData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={130}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%"
                    innerRadius={38} outerRadius={55} dataKey="value" paddingAngle={3}>
                    {statusData.map((e,i) => <Cell key={i} fill={e.color}/>)}
                  </Pie>
                  <Tooltip content={<CustomTooltip/>}/>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display:'flex', flexDirection:'column', gap:5, marginTop:6 }}>
                {statusData.map(d => (
                  <div key={d.name} onClick={() => navigate(`/issues?status=${d.name.toUpperCase().replace(' ','_')}`)}
                    style={{ display:'flex', justifyContent:'space-between',
                      alignItems:'center', fontSize:12, cursor:'pointer', padding:'2px 4px',
                      borderRadius:4, transition:'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background='#1a2540'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                    <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                      <div style={{ width:8, height:8, borderRadius:'50%', background:d.color }}/>
                      <span style={{ color:'#8899b8' }}>{d.name}</span>
                    </div>
                    <span style={{ fontWeight:600, color:'#e8edf5' }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : <div style={{ textAlign:'center', color:'#4a5f85', fontSize:13, padding:40 }}>No data</div>}
        </div>

        {/* Issues by type bar */}
        <div className="card" style={{ padding:20 }}>
          <h3 style={{ fontSize:13, fontWeight:600, color:'#8899b8', margin:'0 0 14px',
            textTransform:'uppercase', letterSpacing:'0.06em' }}>By Type</h3>
          {typeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={typeData} barSize={28}>
                <XAxis dataKey="name" tick={{ fill:'#4a5f85', fontSize:11 }}
                  axisLine={false} tickLine={false}/>
                <YAxis tick={{ fill:'#4a5f85', fontSize:11 }}
                  axisLine={false} tickLine={false} allowDecimals={false}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Bar dataKey="count" fill="#4f7cff" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          ) : <div style={{ textAlign:'center', color:'#4a5f85', fontSize:13, padding:40 }}>No data</div>}
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display:'grid',
        gridTemplateColumns: user?.role==='ADMIN' && topAssignees.length ? '1fr 280px' : '1fr',
        gap:16 }}>
        {/* Recent issues */}
        <div className="card" style={{ overflow:'hidden' }}>
          <div style={{ padding:'14px 20px', borderBottom:'1px solid #1e2d4a',
            display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <h3 style={{ fontSize:13, fontWeight:600, color:'#8899b8', margin:0,
              textTransform:'uppercase', letterSpacing:'0.06em' }}>Recent Issues</h3>
            <button onClick={() => navigate('/issues')} style={{
              background:'none', border:'none', color:'#4f7cff', fontSize:12,
              cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}>
              View all <ArrowRight size={12}/>
            </button>
          </div>
          {recentIssues.length === 0
            ? <div style={{ padding:32, textAlign:'center', color:'#4a5f85', fontSize:13 }}>
                No issues yet.{' '}
                <span style={{ color:'#4f7cff', cursor:'pointer' }}
                  onClick={() => navigate('/issues/new')}>Create one →</span>
              </div>
            : recentIssues.map(issue => (
              <div key={issue.id} className="table-row"
                style={{ padding:'12px 20px', display:'flex',
                  alignItems:'center', gap:12 }}
                onClick={() => navigate(`/issues/${issue.id}`)}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:500, color:'#e8edf5',
                    whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                    {issue.title}
                  </div>
                  <div style={{ fontSize:11, color:'#4a5f85', marginTop:2 }}>
                    #{issue.issueNumber} · {timeAgo(issue.createdAt)}
                  </div>
                </div>
                <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                  <Badge type="priority" value={issue.priority}/>
                  <Badge type="status"   value={issue.status}/>
                </div>
              </div>
            ))
          }
        </div>

        {/* Top assignees (admin) */}
        {user?.role==='ADMIN' && topAssignees.length > 0 && (
          <div className="card" style={{ overflow:'hidden' }}>
            <div style={{ padding:'14px 20px', borderBottom:'1px solid #1e2d4a' }}>
              <h3 style={{ fontSize:13, fontWeight:600, color:'#8899b8', margin:0,
                textTransform:'uppercase', letterSpacing:'0.06em' }}>Top Assignees</h3>
            </div>
            {topAssignees.map((a,i) => (
              <div key={i} style={{ padding:'11px 20px', display:'flex',
                alignItems:'center', gap:10,
                borderBottom: i < topAssignees.length-1 ? '1px solid #1e2d4a' : 'none' }}>
                <span style={{ fontSize:11, fontWeight:700, color:'#4a5f85',
                  width:18, textAlign:'center', flexShrink:0 }}>#{i+1}</span>
                <Avatar name={a.user?.name} size={30}/>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:500, color:'#e8edf5',
                    whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                    {a.user?.name}
                  </div>
                  <div style={{ fontSize:11, color:'#4a5f85', textTransform:'capitalize' }}>
                    {a.user?.role?.toLowerCase()}
                  </div>
                </div>
                <div style={{ fontFamily:'Syne,sans-serif', fontSize:18,
                  fontWeight:700, color:'#4f7cff', flexShrink:0 }}>
                  {a.issueCount}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
