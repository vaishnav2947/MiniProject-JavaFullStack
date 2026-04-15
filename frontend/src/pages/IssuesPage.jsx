import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../utils/api'
import { Badge, Avatar, timeAgo } from '../utils/helpers.jsx'
import { Search, Plus, ChevronLeft, ChevronRight, X, SlidersHorizontal,
         AlertTriangle, ArrowUpDown } from 'lucide-react'

const STATUSES   = [['','All Statuses'],['OPEN','Open'],['IN_PROGRESS','In Progress'],
                    ['RESOLVED','Resolved'],['CLOSED','Closed']]
const PRIORITIES = [['','All Priorities'],['CRITICAL','🔴 Critical'],['HIGH','🟠 High'],
                    ['MEDIUM','🟡 Medium'],['LOW','🟢 Low']]
const TYPES      = [['','All Types'],['BUG','🐛 Bug'],['FEATURE','✨ Feature'],
                    ['TASK','✅ Task'],['IMPROVEMENT','🔧 Improvement']]
const SORTS      = [['createdAt','Newest'],['updatedAt','Last Updated'],
                    ['priority','Priority'],['status','Status']]

const priorityOrder = { CRITICAL:0, HIGH:1, MEDIUM:2, LOW:3 }

export default function IssuesPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [issues, setIssues] = useState([])
  const [total, setTotal]   = useState(0)
  const [pages, setPages]   = useState(1)
  const [loading, setLoading] = useState(true)

  const [search,   setSearch]   = useState(searchParams.get('search')   || '')
  const [status,   setStatus]   = useState(searchParams.get('status')   || '')
  const [priority, setPriority] = useState(searchParams.get('priority') || '')
  const [type,     setType]     = useState(searchParams.get('type')     || '')
  const [sortBy,   setSortBy]   = useState(searchParams.get('sortBy')   || 'createdAt')
  const [page,     setPage]     = useState(1)
  const [debouncedSearch, setDebouncedSearch] = useState(search)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  const fetchIssues = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (debouncedSearch) params.set('search',   debouncedSearch)
      if (status)          params.set('status',   status)
      if (priority)        params.set('priority', priority)
      if (type)            params.set('type',     type)
      params.set('sortBy', sortBy)
      params.set('page',   page)
      params.set('limit',  15)
      const { data } = await api.get(`/issues?${params}`)
      setIssues(data.issues || [])
      setTotal(data.total  || 0)
      setPages(data.pages  || 1)
      // Sync URL
      setSearchParams(Object.fromEntries(params), { replace: true })
    } catch (e) {
      setIssues([])
    } finally { setLoading(false) }
  }, [debouncedSearch, status, priority, type, sortBy, page])

  useEffect(() => { fetchIssues() }, [fetchIssues])

  const clearFilter = (key) => {
    if (key === 'search')   { setSearch('');   }
    if (key === 'status')   { setStatus('');   }
    if (key === 'priority') { setPriority(''); }
    if (key === 'type')     { setType('');     }
    setPage(1)
  }

  const activeFilters = [
    search   && { key:'search',   label:`"${search}"` },
    status   && { key:'status',   label: STATUSES.find(s=>s[0]===status)?.[1] },
    priority && { key:'priority', label: PRIORITIES.find(p=>p[0]===priority)?.[1] },
    type     && { key:'type',     label: TYPES.find(t=>t[0]===type)?.[1] },
  ].filter(Boolean)

  const urgentCount = issues.filter(i =>
    (i.priority === 'CRITICAL' || i.priority === 'HIGH') &&
    (i.status === 'OPEN' || i.status === 'IN_PROGRESS')).length

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
        flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:24, fontWeight:800,
            color:'#e8edf5', margin:0, letterSpacing:'-0.02em' }}>Issues</h1>
          <p style={{ color:'#8899b8', fontSize:13, margin:'4px 0 0' }}>
            {total} issue{total!==1?'s':''} total
            {urgentCount > 0 && (
              <span style={{ marginLeft:10, color:'#ef4444', fontWeight:600,
                fontSize:12, display:'inline-flex', alignItems:'center', gap:4 }}>
                <AlertTriangle size={11}/> {urgentCount} urgent
              </span>
            )}
          </p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/issues/new')}
          style={{ cursor:'pointer' }}>
          <Plus size={15}/> New Issue
        </button>
      </div>

      {/* Filters */}
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {/* Search bar */}
        <div style={{ position:'relative' }}>
          <Search size={15} style={{ position:'absolute', left:12, top:'50%',
            transform:'translateY(-50%)', color:'#4a5f85', pointerEvents:'none' }} />
          <input className="input-field" style={{ paddingLeft:36, paddingRight:36 }}
            placeholder="Search by title or description…"
            value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
          {search && (
            <button onClick={() => clearFilter('search')} style={{
              position:'absolute', right:10, top:'50%', transform:'translateY(-50%)',
              background:'none', border:'none', color:'#4a5f85', cursor:'pointer', padding:4 }}>
              <X size={14}/>
            </button>
          )}
        </div>

        {/* Filter row */}
        <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
          <SlidersHorizontal size={14} color="#4a5f85" style={{ flexShrink:0 }}/>
          {/* Status filter */}
          <select className="select-field" style={{ width:'auto', minWidth:140 }}
            value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}>
            {STATUSES.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          {/* Priority filter */}
          <select className="select-field" style={{ width:'auto', minWidth:140 }}
            value={priority} onChange={e => { setPriority(e.target.value); setPage(1) }}>
            {PRIORITIES.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          {/* Type filter */}
          <select className="select-field" style={{ width:'auto', minWidth:140 }}
            value={type} onChange={e => { setType(e.target.value); setPage(1) }}>
            {TYPES.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          {/* Sort */}
          <div style={{ display:'flex', alignItems:'center', gap:6, marginLeft:'auto' }}>
            <ArrowUpDown size={13} color="#4a5f85"/>
            <select className="select-field" style={{ width:'auto', minWidth:130 }}
              value={sortBy} onChange={e => { setSortBy(e.target.value); setPage(1) }}>
              {SORTS.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        </div>

        {/* Active filter chips */}
        {activeFilters.length > 0 && (
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
            <span style={{ fontSize:11, color:'#4a5f85' }}>Active:</span>
            {activeFilters.map(f => (
              <span key={f.key} style={{
                display:'inline-flex', alignItems:'center', gap:5,
                fontSize:11, padding:'3px 10px', borderRadius:999,
                background:'rgba(79,124,255,0.12)', color:'#4f7cff',
                border:'1px solid rgba(79,124,255,0.3)'
              }}>
                {f.label}
                <button onClick={() => clearFilter(f.key)} style={{
                  background:'none', border:'none', color:'#4f7cff',
                  cursor:'pointer', padding:0, lineHeight:1 }}>
                  <X size={10}/>
                </button>
              </span>
            ))}
            <button onClick={() => {
              setSearch(''); setStatus(''); setPriority(''); setType(''); setPage(1)
            }} style={{ fontSize:11, color:'#8899b8', background:'none',
              border:'none', cursor:'pointer', textDecoration:'underline' }}>
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Issues table */}
      <div className="card" style={{ overflow:'hidden' }}>
        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:40 }}>
            <div style={{ width:30, height:30, border:'3px solid #1e2d4a',
              borderTopColor:'#4f7cff', borderRadius:'50%',
              animation:'spin 0.8s linear infinite' }}/>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : issues.length === 0 ? (
          <div style={{ padding:48, textAlign:'center' }}>
            <div style={{ fontSize:36, marginBottom:12 }}>🔍</div>
            <p style={{ color:'#8899b8', fontSize:14, margin:0 }}>No issues found.</p>
            {activeFilters.length === 0 && (
              <button className="btn-primary" onClick={() => navigate('/issues/new')}
                style={{ margin:'16px auto 0', cursor:'pointer' }}>
                <Plus size={14}/> Create first issue
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Table header */}
            <div style={{ display:'grid',
              gridTemplateColumns:'2.5fr 100px 100px 110px 130px',
              gap:12, padding:'10px 20px', borderBottom:'1px solid #1e2d4a' }}>
              {['Issue','Type','Priority','Status','Assignee'].map(h => (
                <div key={h} style={{ fontSize:11, fontWeight:600,
                  color:'#4a5f85', textTransform:'uppercase', letterSpacing:'0.06em' }}>
                  {h}
                </div>
              ))}
            </div>
            {issues.map(issue => {
              const isUrgent = (issue.priority==='CRITICAL'||issue.priority==='HIGH')
                && (issue.status==='OPEN'||issue.status==='IN_PROGRESS')
              return (
                <div key={issue.id} className="table-row"
                  style={{
                    display:'grid',
                    gridTemplateColumns:'2.5fr 100px 100px 110px 130px',
                    gap:12, padding:'13px 20px', alignItems:'center',
                    borderLeft: isUrgent
                      ? `3px solid ${issue.priority==='CRITICAL'?'#ef4444':'#f97316'}`
                      : '3px solid transparent'
                  }}
                  onClick={() => navigate(`/issues/${issue.id}`)}>
                  <div style={{ minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                      <span style={{ fontSize:11, fontFamily:'JetBrains Mono,monospace',
                        color:'#4a5f85', flexShrink:0 }}>#{issue.issueNumber}</span>
                      <span style={{ fontSize:13, fontWeight:500, color:'#e8edf5',
                        overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {issue.title}
                      </span>
                    </div>
                    <div style={{ fontSize:11, color:'#4a5f85', marginTop:3 }}>
                      by {issue.reporter?.name} · {timeAgo(issue.createdAt)}
                    </div>
                  </div>
                  <div><Badge type="type"     value={issue.type}     /></div>
                  <div><Badge type="priority" value={issue.priority} /></div>
                  <div><Badge type="status"   value={issue.status}   /></div>
                  <div>
                    {issue.assignee
                      ? <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                          <Avatar name={issue.assignee.name} size={22}/>
                          <span style={{ fontSize:12, color:'#8899b8',
                            overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                            {issue.assignee.name}
                          </span>
                        </div>
                      : <span style={{ fontSize:12, color:'#4a5f85' }}>Unassigned</span>
                    }
                  </div>
                </div>
              )
            })}
          </>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
          <button className="btn-secondary"
            disabled={page<=1}
            style={{ cursor:page<=1?'not-allowed':'pointer', opacity:page<=1?0.5:1 }}
            onClick={() => setPage(p => p-1)}>
            <ChevronLeft size={14}/>
          </button>
          {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
            const p = i + 1
            return (
              <button key={p} onClick={() => setPage(p)} style={{
                width:32, height:32, borderRadius:6, border:'none', cursor:'pointer',
                background: page===p ? '#4f7cff' : 'transparent',
                color: page===p ? 'white' : '#8899b8',
                fontSize:13, fontWeight: page===p ? 700 : 400
              }}>{p}</button>
            )
          })}
          <button className="btn-secondary"
            disabled={page>=pages}
            style={{ cursor:page>=pages?'not-allowed':'pointer', opacity:page>=pages?0.5:1 }}
            onClick={() => setPage(p => p+1)}>
            <ChevronRight size={14}/>
          </button>
        </div>
      )}
    </div>
  )
}
