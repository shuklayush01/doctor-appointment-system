import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api/axios'
export default function Dashboard() {
  const [appointments, setAppointments] = useState([])
  const [loading,      setLoading]      = useState(true)
  const name     = localStorage.getItem('name')
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { navigate('/login'); return }
    load()
  }, [])

  const load = () => {
    setLoading(true)
    API.get('/appointments/mine')
      .then(res => {
        console.log('My appointments:', res.data)
        setAppointments(res.data)
      })
      .catch(err => console.log('Dashboard error:', err.response?.data))
      .finally(() => setLoading(false))
  }

  const cancel = async (id) => {
    await API.patch(`/appointments/${id}/status`, { status: 'cancelled' })
    load()
  }

  const statusStyle = s => ({
    padding:'3px 12px', borderRadius:'20px', fontSize:'12px', fontWeight:'500',
    background: s==='confirmed'?'#EAF3DE': s==='cancelled'?'#FCEBEB':'#FAEEDA',
    color:      s==='confirmed'?'#3B6D11': s==='cancelled'?'#A32D2D':'#854F0B'
  })

  return (
    <div style={styles.page}>
      <div style={styles.topRow}>
        <div>
          <h2 style={styles.heading}>My Appointments</h2>
          <p style={styles.sub}>Welcome, {name}</p>
        </div>
        <button style={styles.newBtn} onClick={() => navigate('/doctors')}>
          + Book New
        </button>
      </div>

      {/* Stats */}
      <div style={styles.stats}>
        {['pending','confirmed','cancelled'].map(s => (
          <div key={s} style={styles.stat}>
            <p style={styles.statN}>{appointments.filter(a=>a.status===s).length}</p>
            <p style={styles.statL}>{s}</p>
          </div>
        ))}
      </div>

      {loading && <p style={styles.info}>Loading...</p>}

      {!loading && appointments.length === 0 && (
        <div style={styles.empty}>
          <p style={{color:'#888',marginBottom:'16px'}}>No appointments yet</p>
          <button style={styles.newBtn} onClick={() => navigate('/doctors')}>
            Book Your First Appointment
          </button>
        </div>
      )}

      {appointments.map(a => (
        <div key={a.id} style={styles.card}>
          <div style={styles.cardTop}>
            <div style={styles.avatar}>{(a.doctor_name||'D')[0]}</div>
            <div style={{flex:1}}>
              <p style={styles.docName}>{a.doctor_name}</p>
              <p style={styles.spec}>{a.specialty}</p>
            </div>
            <span style={statusStyle(a.status)}>{a.status}</span>
          </div>
          <div style={styles.details}>
            <span>📅 {a.date}</span>
            <span>🕐 {a.time}</span>
            <span>🎫 #{a.id}</span>
          </div>
          {a.status !== 'cancelled' && (
  <div style={styles.actionRow}>
    <button
      style={styles.rescheduleBtn}
      onClick={() => navigate(`/reschedule/${a.id}`)}
    >
      Reschedule
    </button>
    {a.status === 'pending' && (
      <button
        style={styles.cancelBtn}
        onClick={() => cancel(a.id)}
      >
        Cancel
      </button>
    )}
  </div>
)}
        </div>
      ))}
    </div>
  )
}

const styles = {
  page:      { padding:'24px', maxWidth:'640px', margin:'0 auto' },
  topRow:    { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' },
  heading:   { fontSize:'22px', fontWeight:'600', margin:'0 0 4px' },
  sub:       { fontSize:'14px', color:'#888', margin:0 },
  newBtn:    { background:'#1D9E75', color:'#fff', border:'none', padding:'9px 18px', borderRadius:'8px', cursor:'pointer', fontSize:'14px' },
  stats:     { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px', marginBottom:'24px' },
  stat:      { background:'#fff', border:'1px solid #eee', borderRadius:'10px', padding:'14px', textAlign:'center' },
  statN:     { fontSize:'24px', fontWeight:'600', color:'#1D9E75', margin:'0 0 4px' },
  statL:     { fontSize:'12px', color:'#888', margin:0, textTransform:'capitalize' },
  info:      { textAlign:'center', color:'#888', padding:'40px 0' },
  empty:     { textAlign:'center', padding:'40px', background:'#f9f9f9', borderRadius:'12px' },
  card:      { background:'#fff', border:'1px solid #eee', borderRadius:'12px', padding:'16px', marginBottom:'12px' },
  cardTop:   { display:'flex', alignItems:'center', gap:'12px', marginBottom:'12px' },
  avatar:    { width:'44px', height:'44px', borderRadius:'50%', background:'#E1F5EE', color:'#0F6E56', fontSize:'18px', fontWeight:'600', display:'flex', alignItems:'center', justifyContent:'center' },
  docName:   { fontWeight:'500', fontSize:'15px', margin:'0 0 2px' },
  spec:      { fontSize:'12px', color:'#1D9E75', margin:0 },
  details:   { display:'flex', gap:'16px', fontSize:'13px', color:'#666', paddingTop:'10px', borderTop:'1px solid #f5f5f5', marginBottom:'10px' },
  cancelBtn: { background:'#FCEBEB', color:'#A32D2D', border:'none', padding:'7px 16px', borderRadius:'8px', cursor:'pointer', fontSize:'13px' },
  actionRow: { display:'flex', gap:'8px', paddingTop:'10px', borderTop:'1px solid #f5f5f5' },
  rescheduleBtn: { flex:1, padding:'7px', background:'#E6F1FB', color:'#185FA5', border:'none', borderRadius:'8px', cursor:'pointer', fontSize:'13px', fontWeight:'500' },
}