import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api/axios'

export default function AdminPanel() {
  const [stats,        setStats]        = useState(null)
  const [users,        setUsers]        = useState([])
  const [appointments, setAppointments] = useState([])
  const [activeTab,    setActiveTab]    = useState('stats')
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')
  const navigate                        = useNavigate()

  useEffect(() => {
    const role = localStorage.getItem('role')
    if (role !== 'admin') {
      navigate('/login')
      return
    }
    loadAll()
  }, [])

  const loadAll = async () => {
    try {
      setLoading(true)
      const [statsRes, usersRes, apptsRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/admin/users'),
        API.get('/admin/appointments')
      ])
      setStats(statsRes.data)
      setUsers(usersRes.data)
      setAppointments(apptsRes.data)
      setError('')
    } catch (err) {
      console.log('Admin error:', err.response?.data)
      setError('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  const deleteUser = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return
    try {
      await API.delete(`/admin/users/${id}`)
      loadAll()
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed')
    }
  }

  const deleteAppointment = async (id) => {
    if (!window.confirm('Delete this appointment?')) return
    try {
      await API.delete(`/admin/appointments/${id}`)
      loadAll()
    } catch (err) {
      alert('Delete failed')
    }
  }

  const updateStatus = async (id, status) => {
    try {
      await API.patch(`/admin/appointments/${id}/status`, { status })
      loadAll()
    } catch (err) {
      alert('Update failed')
    }
  }

  const roleColor = r => ({
    padding:'3px 10px', borderRadius:'20px', fontSize:'12px', fontWeight:'500',
    background: r==='admin'  ? '#EEEDFE' : r==='doctor' ? '#E1F5EE' : '#E6F1FB',
    color:      r==='admin'  ? '#3C3489' : r==='doctor' ? '#0F6E56' : '#185FA5'
  })

  const statusColor = s => ({
    padding:'3px 10px', borderRadius:'20px', fontSize:'12px', fontWeight:'500',
    background: s==='confirmed'?'#EAF3DE': s==='cancelled'?'#FCEBEB':'#FAEEDA',
    color:      s==='confirmed'?'#3B6D11': s==='cancelled'?'#A32D2D':'#854F0B'
  })

  if (loading) return <div style={styles.page}><p style={{color:'#888'}}>Loading admin panel...</p></div>
  if (error)   return <div style={styles.page}><p style={{color:'red'}}>{error}</p></div>

  return (
    <div style={styles.page}>

      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Admin Panel</h2>
          <p style={styles.subtitle}>Full system control</p>
        </div>
      </div>

      {/* Stats cards */}
      {stats && (
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <p style={{...styles.statNum, color:'#185FA5'}}>{stats.total_users}</p>
            <p style={styles.statLabel}>Total users</p>
          </div>
          <div style={styles.statCard}>
            <p style={{...styles.statNum, color:'#0F6E56'}}>{stats.total_doctors}</p>
            <p style={styles.statLabel}>Doctors</p>
          </div>
          <div style={styles.statCard}>
            <p style={{...styles.statNum, color:'#534AB7'}}>{stats.total_patients}</p>
            <p style={styles.statLabel}>Patients</p>
          </div>
          <div style={styles.statCard}>
            <p style={{...styles.statNum, color:'#1D9E75'}}>{stats.total_appointments}</p>
            <p style={styles.statLabel}>Appointments</p>
          </div>
          <div style={styles.statCard}>
            <p style={{...styles.statNum, color:'#854F0B'}}>{stats.pending}</p>
            <p style={styles.statLabel}>Pending</p>
          </div>
          <div style={styles.statCard}>
            <p style={{...styles.statNum, color:'#3B6D11'}}>{stats.confirmed}</p>
            <p style={styles.statLabel}>Confirmed</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={styles.tabs}>
        {['stats', 'users', 'appointments'].map(tab => (
          <button
            key={tab}
            style={{
              ...styles.tab,
              background: activeTab === tab ? '#1D9E75' : 'transparent',
              color:      activeTab === tab ? '#fff'    : '#666',
              border:     activeTab === tab ? 'none'    : '1px solid #ddd'
            }}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'stats'        ? 'Overview'
           : tab === 'users'        ? `Users (${users.length})`
           : `Appointments (${appointments.length})`}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {activeTab === 'stats' && stats && (
        <div style={styles.overviewGrid}>
          <div style={styles.overviewCard}>
            <h3 style={styles.overviewTitle}>Appointment status</h3>
            <div style={styles.overviewRow}>
              <span style={styles.overviewLabel}>Pending</span>
              <div style={styles.barWrap}>
                <div style={{
                  ...styles.bar,
                  width: `${stats.total_appointments > 0
                    ? (stats.pending / stats.total_appointments * 100)
                    : 0}%`,
                  background: '#EF9F27'
                }}/>
              </div>
              <span style={styles.overviewNum}>{stats.pending}</span>
            </div>
            <div style={styles.overviewRow}>
              <span style={styles.overviewLabel}>Confirmed</span>
              <div style={styles.barWrap}>
                <div style={{
                  ...styles.bar,
                  width: `${stats.total_appointments > 0
                    ? (stats.confirmed / stats.total_appointments * 100)
                    : 0}%`,
                  background: '#1D9E75'
                }}/>
              </div>
              <span style={styles.overviewNum}>{stats.confirmed}</span>
            </div>
            <div style={styles.overviewRow}>
              <span style={styles.overviewLabel}>Cancelled</span>
              <div style={styles.barWrap}>
                <div style={{
                  ...styles.bar,
                  width: `${stats.total_appointments > 0
                    ? (stats.cancelled / stats.total_appointments * 100)
                    : 0}%`,
                  background: '#E24B4A'
                }}/>
              </div>
              <span style={styles.overviewNum}>{stats.cancelled}</span>
            </div>
          </div>

          <div style={styles.overviewCard}>
            <h3 style={styles.overviewTitle}>User breakdown</h3>
            <div style={styles.overviewRow}>
              <span style={styles.overviewLabel}>Doctors</span>
              <div style={styles.barWrap}>
                <div style={{
                  ...styles.bar,
                  width: `${stats.total_users > 0
                    ? (stats.total_doctors / stats.total_users * 100)
                    : 0}%`,
                  background: '#1D9E75'
                }}/>
              </div>
              <span style={styles.overviewNum}>{stats.total_doctors}</span>
            </div>
            <div style={styles.overviewRow}>
              <span style={styles.overviewLabel}>Patients</span>
              <div style={styles.barWrap}>
                <div style={{
                  ...styles.bar,
                  width: `${stats.total_users > 0
                    ? (stats.total_patients / stats.total_users * 100)
                    : 0}%`,
                  background: '#378ADD'
                }}/>
              </div>
              <span style={styles.overviewNum}>{stats.total_patients}</span>
            </div>
          </div>
        </div>
      )}

      {/* Users tab */}
      {activeTab === 'users' && (
        <div>
          {users.map(u => (
            <div key={u.id} style={styles.row}>
              <div style={styles.rowAvatar}>
                {u.name[0].toUpperCase()}
              </div>
              <div style={{flex:1}}>
                <p style={styles.rowName}>{u.name}</p>
                <p style={styles.rowSub}>{u.email}
                  {u.specialty && ` — ${u.specialty}`}
                </p>
              </div>
              <span style={roleColor(u.role)}>{u.role}</span>
              {u.role !== 'admin' && (
                <button
                  style={styles.deleteBtn}
                  onClick={() => deleteUser(u.id, u.name)}
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Appointments tab */}
      {activeTab === 'appointments' && (
        <div>
          {appointments.map(a => (
            <div key={a.id} style={styles.apptRow}>
              <div style={{flex:1}}>
                <p style={styles.rowName}>
                  {a.patient_name}
                  <span style={styles.arrow}> → </span>
                  {a.doctor_name}
                </p>
                <p style={styles.rowSub}>
                  {a.date} at {a.time} — {a.specialty}
                </p>
              </div>
              <span style={statusColor(a.status)}>{a.status}</span>

              {/* Status change buttons */}
              <div style={styles.apptActions}>
                {a.status !== 'confirmed' && (
                  <button
                    style={styles.confirmBtn}
                    onClick={() => updateStatus(a.id, 'confirmed')}
                  >
                    Confirm
                  </button>
                )}
                {a.status !== 'cancelled' && (
                  <button
                    style={styles.cancelBtn}
                    onClick={() => updateStatus(a.id, 'cancelled')}
                  >
                    Cancel
                  </button>
                )}
                <button
                  style={styles.deleteBtn}
                  onClick={() => deleteAppointment(a.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}

const styles = {
  page:          { padding:'24px', maxWidth:'900px', margin:'0 auto' },
  header:        { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' },
  title:         { fontSize:'22px', fontWeight:'600', margin:'0 0 4px' },
  subtitle:      { fontSize:'14px', color:'#888', margin:0 },
  statsGrid:     { display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:'10px', marginBottom:'24px' },
  statCard:      { background:'#fff', border:'1px solid #eee', borderRadius:'10px', padding:'14px', textAlign:'center' },
  statNum:       { fontSize:'22px', fontWeight:'600', margin:'0 0 4px' },
  statLabel:     { fontSize:'11px', color:'#888', margin:0 },
  tabs:          { display:'flex', gap:'8px', marginBottom:'16px' },
  tab:           { padding:'8px 20px', borderRadius:'20px', cursor:'pointer', fontSize:'13px', fontWeight:'500' },
  overviewGrid:  { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' },
  overviewCard:  { background:'#fff', border:'1px solid #eee', borderRadius:'12px', padding:'20px' },
  overviewTitle: { fontSize:'15px', fontWeight:'600', margin:'0 0 16px', color:'#333' },
  overviewRow:   { display:'flex', alignItems:'center', gap:'10px', marginBottom:'12px' },
  overviewLabel: { fontSize:'13px', color:'#888', width:'70px', flexShrink:0 },
  barWrap:       { flex:1, background:'#f5f5f5', borderRadius:'4px', height:'8px', overflow:'hidden' },
  bar:           { height:'8px', borderRadius:'4px', transition:'width 0.3s' },
  overviewNum:   { fontSize:'13px', fontWeight:'500', width:'24px', textAlign:'right' },
  row:           { display:'flex', alignItems:'center', gap:'12px', background:'#fff', border:'1px solid #eee', borderRadius:'10px', padding:'14px', marginBottom:'8px' },
  rowAvatar:     { width:'38px', height:'38px', borderRadius:'50%', background:'#E1F5EE', color:'#0F6E56', fontWeight:'600', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', flexShrink:0 },
  rowName:       { fontWeight:'500', fontSize:'14px', margin:'0 0 2px' },
  rowSub:        { fontSize:'12px', color:'#888', margin:0 },
  arrow:         { color:'#1D9E75' },
  apptRow:       { display:'flex', alignItems:'center', gap:'12px', background:'#fff', border:'1px solid #eee', borderRadius:'10px', padding:'14px', marginBottom:'8px', flexWrap:'wrap' },
  apptActions:   { display:'flex', gap:'6px' },
  confirmBtn:    { padding:'5px 10px', background:'#EAF3DE', color:'#3B6D11', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'12px' },
  cancelBtn:     { padding:'5px 10px', background:'#FAEEDA', color:'#854F0B', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'12px' },
  deleteBtn:     { padding:'5px 10px', background:'#FCEBEB', color:'#A32D2D', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'12px' },
}