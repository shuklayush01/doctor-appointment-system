import { Link, useNavigate } from 'react-router-dom'

export default function Navbar() {
  const navigate = useNavigate()
  const token    = localStorage.getItem('token')
  const role     = localStorage.getItem('role')

  const logout = () => {
    localStorage.clear()
    navigate('/login')
  }

  const dashboardLink = role === 'doctor' ? '/doctor-dashboard'
                      : role === 'admin'  ? '/admin'
                      : '/dashboard'

  return (
    <nav style={styles.nav}>
      <Link to="/doctors" style={styles.brand}>DocBook</Link>
      <div style={styles.links}>
        {token ? (
          <>
            {role === 'admin' && (
              <Link to="/admin" style={styles.adminLink}>Admin Panel</Link>
            )}
            <Link to={dashboardLink} style={styles.link}>Dashboard</Link>
            <button onClick={logout} style={styles.btn}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login"    style={styles.link}>Login</Link>
            <Link to="/register" style={styles.link}>Register</Link>
          </>
        )}
      </div>
    </nav>
  )
}

const styles = {
  nav:       { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 24px', background:'#1D9E75' },
  brand:     { color:'#fff', textDecoration:'none', fontSize:'20px', fontWeight:'600' },
  links:     { display:'flex', gap:'16px', alignItems:'center' },
  link:      { color:'#fff', textDecoration:'none', fontSize:'14px' },
  adminLink: { color:'#fff', textDecoration:'none', fontSize:'14px', background:'rgba(255,255,255,0.2)', padding:'4px 12px', borderRadius:'20px' },
  btn:       { background:'transparent', border:'1px solid #fff', color:'#fff', padding:'6px 14px', borderRadius:'6px', cursor:'pointer' }
}