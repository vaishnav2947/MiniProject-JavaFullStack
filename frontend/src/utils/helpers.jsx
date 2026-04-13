import { formatDistanceToNow, format } from 'date-fns'

export const timeAgo = (date) => {
  if (!date) return '—'
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export const formatDate = (date, fmt = 'MMM d, yyyy') => {
  if (!date) return '—'
  return format(new Date(date), fmt)
}

// Java enums come back as UPPER_CASE — normalize to lowercase for display
const norm = (v) => (v || '').toLowerCase().replace('_', '-')

export const priorityConfig = {
  low:      { label: 'Low',      color: '#10b981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.3)'  },
  medium:   { label: 'Medium',   color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.3)'  },
  high:     { label: 'High',     color: '#f97316', bg: 'rgba(249,115,22,0.1)',  border: 'rgba(249,115,22,0.3)'  },
  critical: { label: 'Critical', color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.3)'   }
}

export const statusConfig = {
  'open':        { label: 'Open',        color: '#8899b8', bg: 'rgba(136,153,184,0.1)', border: 'rgba(136,153,184,0.3)' },
  'in-progress': { label: 'In Progress', color: '#4f7cff', bg: 'rgba(79,124,255,0.1)',  border: 'rgba(79,124,255,0.3)'  },
  'in_progress': { label: 'In Progress', color: '#4f7cff', bg: 'rgba(79,124,255,0.1)',  border: 'rgba(79,124,255,0.3)'  },
  'resolved':    { label: 'Resolved',    color: '#10b981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.3)'  },
  'closed':      { label: 'Closed',      color: '#6b7280', bg: 'rgba(107,114,128,0.1)', border: 'rgba(107,114,128,0.3)' }
}

export const typeConfig = {
  bug:         { label: 'Bug',         color: '#ef4444', icon: '🐛' },
  feature:     { label: 'Feature',     color: '#4f7cff', icon: '✨' },
  task:        { label: 'Task',        color: '#10b981', icon: '✅' },
  improvement: { label: 'Improvement', color: '#f59e0b', icon: '🔧' }
}

export const Badge = ({ type, value }) => {
  const key = norm(value)
  const config = type === 'priority'
    ? priorityConfig[key]
    : type === 'status'
      ? statusConfig[key]
      : typeConfig[key]

  if (!config) return (
    <span style={{ fontSize: 11, color: '#4a5f85', padding: '2px 8px' }}>{value}</span>
  )

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '2px 10px', borderRadius: '999px', fontSize: '11px',
      fontWeight: 600, letterSpacing: '0.04em',
      color: config.color, background: config.bg, border: `1px solid ${config.border}`
    }}>
      {type === 'type' && config.icon}
      {config.label}
    </span>
  )
}

export const Avatar = ({ name = '', size = 32 }) => {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const colors = ['#4f7cff', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4']
  const color = colors[(name.charCodeAt(0) || 0) % colors.length]

  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `${color}22`, border: `2px solid ${color}44`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.35, fontWeight: 700, color, flexShrink: 0,
      fontFamily: 'Syne, sans-serif'
    }}>
      {initials || '?'}
    </div>
  )
}

export const getErrorMessage = (err) =>
  err?.response?.data?.message ||
  err?.response?.data?.errors?.[0]?.msg ||
  err?.message ||
  'Something went wrong'

// Convert frontend status string to Java enum format for API calls
export const toJavaStatus = (s) => s.toUpperCase().replace('-', '_')
// Convert Java enum back to frontend format
export const fromJavaStatus = (s) => (s || '').toLowerCase().replace('_', '-')
