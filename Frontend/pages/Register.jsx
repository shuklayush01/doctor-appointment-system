import { useState } from 'react'
import API from '../api/axios'
import { useNavigate, Link } from 'react-router-dom'

export default function Register() {
  const [form, setForm]   = useState({ name:'', email:'', password:'', role:'patient' })
  const [msg, setMsg]     = useState('')
  const navigate          = useNavigate()

  const handleSubmit = async () => {
    try {
      await API.post('/auth/register', form)
      setMsg('Registered! Redirecting...')
      setTimeout(() => navigate('/login'), 1500)
    } catch {
      setMsg('Email already exists')
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create account</h2>
        {msg && <p style={styles.msg}>{msg}</p>}
        <input style={styles.input} placeholder="Full name"
          onChange={e => setForm({...form, name: e.target.value})} />
        <input style={styles.input} placeholder="Email"
          onChange={e => setForm({...form, email: e.target.value})} />
        <input style={styles.input} type="password" placeholder="Password"
          onChange={e => setForm({...form, password: e.target.value})} />
        <select style={styles.input}
          onChange={e => setForm({...form, role: e.target.value})}>
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
        </select>
        <button style={styles.btn} onClick={handleSubmit}>Register</button>
        <p style={styles.sub}>Have account? <Link to="/login">Login here</Link></p>
      </div>
    </div>
  )
}

const styles = {
  container: { display:'flex', justifyContent:'center', alignItems:'center', minHeight:'80vh' },
  card:      { background:'#fff', padding:'32px', borderRadius:'12px', boxShadow:'0 2px 12px rgba(0,0,0,0.1)', width:'100%', maxWidth:'380px' },
  title:     { marginBottom:'20px', fontSize:'22px', fontWeight:'600' },
  input:     { width:'100%', padding:'10px 12px', marginBottom:'12px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'14px', boxSizing:'border-box' },
  btn:       { width:'100%', padding:'11px', background:'#1D9E75', color:'#fff', border:'none', borderRadius:'8px', fontSize:'15px', cursor:'pointer' },
  msg:       { color:'green', fontSize:'13px', marginBottom:'10px' },
  sub:       { textAlign:'center', fontSize:'13px', marginTop:'12px' }
}