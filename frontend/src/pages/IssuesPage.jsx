import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { Badge, Avatar, timeAgo } from '../utils/helpers.jsx'
import { Search, Plus, Filter, ChevronLeft, ChevronRight, X } from 'lucide-react'

export default function IssuesPage() {
  const navigate = useNavigate()
  const [issues, setIssues] = useState([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ search: '', status: '', priority: '', type: '', page: 1 })
  const [searchInput, setSearchInput] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const fetchIssues = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.search)   params.set('search', filters.search)
      if (filters.status)   params.set('status', filters.status)
      if (filters.priority) params.set('priority', filters.priority)
      if (filters.type)     params.set('type', filters.type)
      params.set('page', filters.page)
      params.set('limit', 12)
      const { data } = await api.get(`/issues?${params}`)
      setIssues(data.issues)
      setTotal(data.total)
      setPages(data.pages)
    } finally { setLoading(false) }
  }, [filters])

  useEffect(() => { fetchIssues() }, [fetchIssues])

  useEffect(() => {
    const t = setTimeout(() => setFilters(f => ({ ...f, search: searchInput, page: 1 })), 400)
    return () => clearTimeout(t)
  }, [searchInput])

  const setFilter = (key, value) => setFilters(f => ({ ...f, [key]: value, page: 1 }))
  const hasFilters = filters.status || filters.priority || filters.type || filters.search
  const clearFilters = () => { setFilters({ search: '', status: '', priority: '', type: '', page: 1 }); setSearchInput('') }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 800, color: '#e8edf5', margin: 0, letterSpacing: '-0.02em' }}>Issues</h1>
          <p style={{ color: '#8899b8', fontSize: 13, margin: '4px 0 0' }}>{total} issue{total !== 1 ? 's' : ''} total</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-secondary" onClick={() => setShowFilters(v => !v)} style={{ cursor: 'pointer', position: 'relative' }}>
            <Filter size={14} /> Filters
            {hasFilters && <span style={{ position: 'absolute', top: -4, right: -4, width: 8, height: 8, borderRadius: '50%', background: '#4f7cff' }} />}
          </button>
          <button className="btn-primary" onClick={() => navigate('/issues/new')} style={{ cursor: 'pointer' }}>
            <Plus size={15} /> New Issue
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative' }}>
        <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#4a5f85', pointerEvents: 'none' }} />
        <input className="input-field" style={{ paddingLeft: 36, paddingRight: searchInput ? 36 : 12 }}
          placeholder="Search issues by title or description…"
          value={searchInput} onChange={e => setSearchInput(e.target.value)} />
        {searchInput && (
          <button onClick={() => { setSearchInput(''); setFilter('search', '') }} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#4a5f85', cursor: 'pointer', padding: 4 }}>
            <X size={14} />
          </button>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', padding: 16, background: '#0f1629', borderRadius: 12, border: '1px solid #1e2d4a', alignItems: 'center' }}>
          <select className="select-field" style={{ width: 'auto', minWidth: 130 }} value={filters.status} onChange={e => setFilter('status', e.target.value)}>
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
          <select className="select-field" style={{ width: 'auto', minWidth: 130 }} value={filters.priority} onChange={e => setFilter('priority', e.target.value)}>
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
          <select className="select-field" style={{ width: 'auto', minWidth: 130 }} value={filters.type} onChange={e => setFilter('type', e.target.value)}>
            <option value="">All Types</option>
            <option value="BUG">Bug</option>
            <option value="FEATURE">Feature</option>
            <option value="TASK">Task</option>
            <option value="IMPROVEMENT">Improvement</option>
          </select>
          {hasFilters && (
            <button onClick={clearFilters} className="btn-secondary" style={{ cursor: 'pointer', fontSize: 12 }}>
              <X size={12} /> Clear
            </button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <div style={{ width: 30, height: 30, border: '3px solid #1e2d4a', borderTopColor: '#4f7cff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : issues.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
            <p style={{ color: '#8899b8', fontSize: 14, margin: 0 }}>No issues found.</p>
            {!hasFilters && <button className="btn-primary" onClick={() => navigate('/issues/new')} style={{ margin: '16px auto 0', cursor: 'pointer' }}><Plus size={14} /> Create first issue</button>}
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: 12, padding: '10px 20px', borderBottom: '1px solid #1e2d4a' }}>
              {['Issue', 'Type', 'Priority', 'Status', 'Assignee'].map(h => (
                <div key={h} style={{ fontSize: 11, fontWeight: 600, color: '#4a5f85', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</div>
              ))}
            </div>
            {issues.map(issue => (
              <div key={issue.id} className="table-row"
                style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: 12, padding: '14px 20px', alignItems: 'center' }}
                onClick={() => navigate(`/issues/${issue.id}`)}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: '#4a5f85', flexShrink: 0 }}>#{issue.issueNumber}</span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#e8edf5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{issue.title}</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#4a5f85', marginTop: 3 }}>by {issue.reporter?.name} · {timeAgo(issue.createdAt)}</div>
                </div>
                <div><Badge type="type"     value={issue.type}     /></div>
                <div><Badge type="priority" value={issue.priority} /></div>
                <div><Badge type="status"   value={issue.status}   /></div>
                <div>
                  {issue.assignee
                    ? <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Avatar name={issue.assignee.name} size={24} />
                        <span style={{ fontSize: 12, color: '#8899b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{issue.assignee.name}</span>
                      </div>
                    : <span style={{ fontSize: 12, color: '#4a5f85' }}>Unassigned</span>
                  }
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <button className="btn-secondary" disabled={filters.page <= 1} style={{ cursor: filters.page <= 1 ? 'not-allowed' : 'pointer', opacity: filters.page <= 1 ? 0.5 : 1 }}
            onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}>
            <ChevronLeft size={14} />
          </button>
          <span style={{ fontSize: 13, color: '#8899b8' }}>Page {filters.page} of {pages}</span>
          <button className="btn-secondary" disabled={filters.page >= pages} style={{ cursor: filters.page >= pages ? 'not-allowed' : 'pointer', opacity: filters.page >= pages ? 0.5 : 1 }}
            onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}>
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  )
}
