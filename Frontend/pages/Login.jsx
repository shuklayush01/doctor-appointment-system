import { useState } from 'react'
import API from '../api/axios'
import { useNavigate, Link } from 'react-router-dom'

export default function Login() {
  const [form, setForm]     = useState({ email:'', password:'' })
  const [error, setError]   = useState('')
  const navigate            = useNavigate()

  const handleSubmit = async () => {
    try {
      const { data } = await API.post('/auth/login', form)
      localStorage.setItem('token', data.token)
      localStorage.setItem('role',  data.role)
      localStorage.setItem('name',  data.name)
      navigate('/doctors')
    } catch {
      setError('Invalid email or password')
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Welcome back</h2>
        {error && <p style={styles.error}>{error}</p>}
        <input style={styles.input} placeholder="Email"
          onChange={e => setForm({...form, email: e.target.value})} />
        <input style={styles.input} type="password" placeholder="Password"
          onChange={e => setForm({...form, password: e.target.value})} />
        <button style={styles.btn} onClick={handleSubmit}>Login</button>
        <p style={styles.sub}>No account? <Link to="/register">Register here</Link></p>
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
  error:     { color:'red', fontSize:'13px', marginBottom:'10px' },
  sub:       { textAlign:'center', fontSize:'13px', marginTop:'12px' }
}