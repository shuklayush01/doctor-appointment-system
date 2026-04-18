import { useEffect, useState } from 'react'
import API from '../api/axios'
import { useNavigate } from 'react-router-dom'

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState('')
  const [filter, setFilter]             = useState('all')
  const name     = localStorage.getItem('name')
  const role     = localStorage.getItem('role')
  const navigate = useNavigate()

  useEffect(() => {
    if (role !== 'doctor') {
      navigate('/dashboard')
      return
    }
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const { data } = await API.get('/appointments/doctor')
      console.log('Doctor appointments:', data)
      setAppointments(data)
      setError('')
    } catch (err) {
      console.log('Error:', err.response)
      setError('Could not load appointments')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id, status) => {
    try {
      await API.patch(`/appointments/${id}/status`, { status })
      fetchAppointments()
    } catch (err) {
      console.log('Update error:', err)
    }
  }

  const filtered = filter === 'all'
    ? appointments
    : appointments.filter(a => a.status === filter)

  const statusStyle = (s) => ({
    padding:      '3px 10px',
    borderRadius: '20px',
    fontSize:     '12px',
    fontWeight:   '500',
    background:   s === 'confirmed' ? '#EAF3DE' : s === 'cancelled' ? '#FCEBEB' : '#FAEEDA',
    color:        s === 'confirmed' ? '#3B6D11' : s === 'cancelled' ? '#A32D2D' : '#854F0B'
  })

  return (
    <div style={styles.container}>

      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Doctor Dashboard</h2>
          <p style={styles.subtitle}>Dr. {name}</p>
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <p style={styles.statNum}>{appointments.length}</p>
          <p style={styles.statLabel}>Total</p>
        </div>
        <div style={{...styles.statCard, borderTop: '3px solid #BA7517'}}>
          <p style={{...styles.statNum, color:'#BA7517'}}>
            {appointments.filter(a => a.status === 'pending').length}
          </p>
          <p style={styles.statLabel}>Pending</p>
        </div>
        <div style={{...styles.statCard, borderTop: '3px solid #3B6D11'}}>
          <p style={{...styles.statNum, color:'#3B6D11'}}>
            {appointments.filter(a => a.status === 'confirmed').length}
          </p>
          <p style={styles.statLabel}>Confirmed</p>
        </div>
        <div style={{...styles.statCard, borderTop: '3px solid #A32D2D'}}>
          <p style={{...styles.statNum, color:'#A32D2D'}}>
            {appointments.filter(a => a.status === 'cancelled').length}
          </p>
          <p style={styles.statLabel}>Cancelled</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={styles.tabs}>
        {['all','pending','confirmed','cancelled'].map(f => (
          <button
            key={f}
            style={{
              ...styles.tab,
              background:  filter === f ? '#1D9E75' : 'transparent',
              color:       filter === f ? '#fff'    : '#666',
              border:      filter === f ? 'none'    : '1px solid #ddd'
            }}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <p style={styles.infoText}>Loading appointments...</p>
      )}

      {/* Error */}
      {error && (
        <p style={styles.errorText}>{error}</p>
      )}

      {/* Empty */}
      {!loading && !error && filtered.length === 0 && (
        <div style={styles.emptyBox}>
          <p style={styles.emptyText}>No {filter === 'all' ? '' : filter} appointments</p>
        </div>
      )}

      {/* Appointment cards */}
      {!loading && filtered.map(a => (
        <div key={a.id} style={styles.card}>

          {/* Top row */}
          <div style={styles.cardTop}>
            <div style={styles.avatar}>
              {a.patient_name ? a.patient_name[0].toUpperCase() : 'P'}
            </div>
            <div style={{ flex:1 }}>
              <p style={styles.patientName}>{a.patient_name}</p>
              <span style={statusStyle(a.status)}>{a.status}</span>
            </div>
            <p style={styles.bookingId}>#{a.id}</p>
          </div>

          {/* Date and time */}
          <div style={styles.cardDetails}>
            <div style={styles.detailItem}>
              <span style={styles.icon}>📅</span>
              <span style={styles.detailText}>{a.date}</span>
            </div>
            <div style={styles.detailItem}>
              <span style={styles.icon}>🕐</span>
              <span style={styles.detailText}>{a.time}</span>
            </div>
          </div>

          {/* Action buttons — only show if pending */}
          {a.status === 'pending' && (
            <div style={styles.actions}>
              <button
                style={styles.confirmBtn}
                onClick={() => updateStatus(a.id, 'confirmed')}
              >
                Confirm Appointment
              </button>
              <button
                style={styles.cancelBtn}
                onClick={() => updateStatus(a.id, 'cancelled')}
              >
                Cancel
              </button>
            </div>
          )}

          {/* Already confirmed — show completed button */}
          {a.status === 'confirmed' && (
            <div style={styles.actions}>
              <button
                style={styles.doneBtn}
                onClick={() => updateStatus(a.id, 'cancelled')}
              >
                Mark as Cancelled
              </button>
            </div>
          )}

        </div>
      ))}

    </div>
  )
}

const styles = {
  container:   { padding:'24px', maxWidth:'640px', margin:'0 auto' },
  header:      { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' },
  title:       { fontSize:'22px', fontWeight:'600', margin:'0 0 4px' },
  subtitle:    { fontSize:'14px', color:'#888', margin:0 },
  statsRow:    { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'24px' },
  statCard:    { background:'#fff', border:'1px solid #eee', borderRadius:'10px', padding:'14px', textAlign:'center' },
  statNum:     { fontSize:'24px', fontWeight:'600', margin:'0 0 4px', color:'#1D9E75' },
  statLabel:   { fontSize:'12px', color:'#888', margin:0 },
  tabs:        { display:'flex', gap:'8px', marginBottom:'16px' },
  tab:         { padding:'6px 16px', borderRadius:'20px', cursor:'pointer', fontSize:'13px' },
  infoText:    { textAlign:'center', color:'#888', padding:'32px 0' },
  errorText:   { textAlign:'center', color:'red', padding:'16px' },
  emptyBox:    { textAlign:'center', padding:'40px', background:'#f9f9f9', borderRadius:'12px' },
  emptyText:   { color:'#888', fontSize:'15px' },
  card:        { background:'#fff', border:'1px solid #eee', borderRadius:'12px', padding:'16px', marginBottom:'12px' },
  cardTop:     { display:'flex', alignItems:'center', gap:'12px', marginBottom:'12px' },
  avatar:      { width:'44px', height:'44px', borderRadius:'50%', background:'#E6F1FB', color:'#185FA5', fontSize:'18px', fontWeight:'600', display:'flex', alignItems:'center', justifyContent:'center' },
  patientName: { fontWeight:'500', fontSize:'15px', margin:'0 0 4px' },
  bookingId:   { fontSize:'12px', color:'#aaa' },
  cardDetails: { display:'flex', gap:'20px', paddingTop:'12px', borderTop:'1px solid #f5f5f5', marginBottom:'12px' },
  detailItem:  { display:'flex', alignItems:'center', gap:'6px' },
  icon:        { fontSize:'14px' },
  detailText:  { fontSize:'13px', color:'#555' },
  actions:     { display:'flex', gap:'8px', paddingTop:'12px', borderTop:'1px solid #f5f5f5' },
  confirmBtn:  { flex:1, padding:'8px', background:'#1D9E75', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer', fontSize:'13px' },
  cancelBtn:   { padding:'8px 16px', background:'#FCEBEB', color:'#A32D2D', border:'none', borderRadius:'8px', cursor:'pointer', fontSize:'13px' },
  doneBtn:     { padding:'8px 16px', background:'#f5f5f5', color:'#666', border:'none', borderRadius:'8px', cursor:'pointer', fontSize:'13px' },
}