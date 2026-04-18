import { useEffect, useState } from 'react'
import API from '../api/axios'
import { useNavigate } from 'react-router-dom'

export default function DoctorList() {
  const [doctors,  setDoctors]  = useState([])
  const [search,   setSearch]   = useState('')
  const [loading,  setLoading]  = useState(true)
  const navigate                = useNavigate()
  const role                    = localStorage.getItem('role')
  const token                   = localStorage.getItem('token')

  useEffect(() => {
    API.get('/doctors/')
      .then(res => {
        console.log('Doctors:', res.data)
        setDoctors(res.data)
      })
      .catch(err => console.log('Error loading doctors:', err))
      .finally(() => setLoading(false))
  }, [])

  const filtered = search.trim() === ''
    ? doctors
    : doctors.filter(d =>
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.specialty.toLowerCase().includes(search.toLowerCase())
      )

  const handleBook = (doctorId) => {
    if (!token) {
      navigate('/login')
      return
    }
    if (role !== 'patient') {
      alert('Please login as a patient to book appointments')
      return
    }
    navigate(`/book/${doctorId}`)
  }

  return (
    <div style={styles.page}>
      <h2 style={styles.heading}>Find a Doctor</h2>

      <input
        style={styles.search}
        placeholder="Search by name or specialty..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {search.trim() !== '' && (
        <p style={styles.count}>
          {filtered.length} doctor{filtered.length !== 1 ? 's' : ''} found
        </p>
      )}

      {loading && <p style={styles.info}>Loading doctors...</p>}

      {!loading && filtered.length === 0 && (
        <p style={styles.info}>No doctors found.</p>
      )}

      <div style={styles.grid}>
        {filtered.map(doc => (
          <div key={doc.id} style={styles.card}>
            <div style={styles.avatar}>{doc.name[0]}</div>
            <h3 style={styles.name}>{doc.name}</h3>
            <span style={styles.badge}>{doc.specialty}</span>
            <p style={styles.bio}>{doc.bio}</p>

            {role === 'patient' && (
              <button style={styles.btn} onClick={() => handleBook(doc.id)}>
                Book Appointment
              </button>
            )}

            {role === 'doctor' && (
              <p style={styles.note}>Login as patient to book</p>
            )}

            {!token && (
              <button style={styles.btn} onClick={() => navigate('/login')}>
                Login to Book
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

const styles = {
  page:    { padding:'24px', maxWidth:'960px', margin:'0 auto' },
  heading: { fontSize:'22px', fontWeight:'600', marginBottom:'16px' },
  search:  { width:'100%', padding:'11px 14px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'14px', marginBottom:'8px', boxSizing:'border-box' },
  count:   { fontSize:'13px', color:'#888', marginBottom:'12px' },
  info:    { textAlign:'center', color:'#888', padding:'40px 0' },
  grid:    { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:'16px', marginTop:'16px' },
  card:    { background:'#fff', border:'1px solid #eee', borderRadius:'12px', padding:'20px', textAlign:'center' },
  avatar:  { width:'56px', height:'56px', borderRadius:'50%', background:'#1D9E75', color:'#fff', fontSize:'24px', fontWeight:'600', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px' },
  name:    { fontSize:'16px', fontWeight:'600', margin:'0 0 8px' },
  badge:   { display:'inline-block', background:'#E1F5EE', color:'#0F6E56', fontSize:'12px', padding:'3px 12px', borderRadius:'20px', marginBottom:'12px' },
  bio:     { fontSize:'13px', color:'#666', marginBottom:'16px', lineHeight:1.5 },
  btn:     { width:'100%', padding:'10px', background:'#1D9E75', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer', fontSize:'14px', fontWeight:'500' },
  note:    { fontSize:'12px', color:'#aaa', marginTop:'4px' }
}