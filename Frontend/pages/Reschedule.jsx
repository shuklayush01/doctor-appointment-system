import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import API from '../api/axios'

export default function Reschedule() {
  const { id }   = useParams()
  const navigate = useNavigate()

  const [appointment,    setAppointment]    = useState(null)
  const [selectedDate,   setSelectedDate]   = useState('')
  const [selectedTime,   setSelectedTime]   = useState('')
  const [availableSlots, setAvailableSlots] = useState([])
  const [bookedSlots,    setBookedSlots]    = useState([])
  const [loadingSlots,   setLoadingSlots]   = useState(false)
  const [loading,        setLoading]        = useState(true)
  const [saving,         setSaving]         = useState(false)
  const [msg,            setMsg]            = useState('')
  const [error,          setError]          = useState('')

  const allSlots = [
    '09:30', '10:00', '11:00',
    '12:00', '14:00', '15:00', '16:00'
  ]

  // load current appointment details
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { navigate('/login'); return }

    API.get('/appointments/mine')
      .then(res => {
        const appt = res.data.find(a => a.id === parseInt(id))
        if (!appt) {
          navigate('/dashboard')
          return
        }
        setAppointment(appt)
        setLoading(false)
      })
      .catch(err => {
        console.log('Error:', err)
        navigate('/dashboard')
      })
  }, [id])

  // fetch available slots when date changes
  useEffect(() => {
    if (!selectedDate || !appointment) return

    setLoadingSlots(true)
    setSelectedTime('')

    API.get(`/appointments/available-slots?doctor_id=${appointment.doctor_id}&date=${selectedDate}`)
      .then(res => {
        setAvailableSlots(res.data.available)
        setBookedSlots(res.data.booked)
      })
      .catch(err => console.log('Slots error:', err))
      .finally(() => setLoadingSlots(false))
  }, [selectedDate])

  const handleReschedule = async () => {
    if (!selectedDate || !selectedTime) {
      setError('Please select a new date and time slot')
      return
    }

    // check if same as current
    if (selectedDate === appointment.date &&
        selectedTime === appointment.time.slice(0,5)) {
      setError('Please choose a different date or time')
      return
    }

    try {
      setSaving(true)
      setError('')
      await API.patch(`/appointments/${id}/reschedule`, {
        date: selectedDate,
        time: selectedTime
      })
      setMsg('Appointment rescheduled successfully!')
      setTimeout(() => navigate('/dashboard'), 2000)
    } catch (err) {
      console.log('Reschedule error:', err.response?.data)
      setError(err.response?.data?.message || 'Reschedule failed')
    } finally {
      setSaving(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  if (loading) {
    return (
      <div style={styles.wrap}>
        <p style={{color:'#888'}}>Loading appointment...</p>
      </div>
    )
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>

        <h2 style={styles.title}>Reschedule Appointment</h2>

        {/* Current appointment info */}
        {appointment && (
          <div style={styles.currentBox}>
            <p style={styles.currentLabel}>Current appointment</p>
            <div style={styles.currentRow}>
              <span style={styles.currentIcon}>👨‍⚕️</span>
              <span style={styles.currentText}>{appointment.doctor_name}</span>
            </div>
            <div style={styles.currentRow}>
              <span style={styles.currentIcon}>📅</span>
              <span style={styles.currentText}>{appointment.date}</span>
            </div>
            <div style={styles.currentRow}>
              <span style={styles.currentIcon}>🕐</span>
              <span style={styles.currentText}>{appointment.time}</span>
            </div>
            <div style={styles.currentRow}>
              <span style={styles.currentIcon}>🔖</span>
              <span style={{
                ...styles.currentText,
                color: appointment.status === 'confirmed' ? '#3B6D11' : '#854F0B'
              }}>
                {appointment.status}
              </span>
            </div>
          </div>
        )}

        {/* Arrow showing change */}
        <p style={styles.changeLabel}>Change to</p>

        {/* Success */}
        {msg && (
          <div style={styles.successBox}>
            <p style={styles.successText}>Rescheduled successfully!</p>
            <p style={styles.successSub}>Redirecting to dashboard...</p>
          </div>
        )}

        {/* Error */}
        {error && <p style={styles.errorText}>{error}</p>}

        {!msg && (
          <>
            {/* New date */}
            <label style={styles.label}>Select New Date</label>
            <input
              style={styles.input}
              type="date"
              min={today}
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
            />

            {/* New time slots */}
            {selectedDate && (
              <>
                <label style={styles.label}>
                  Select New Time Slot
                  {loadingSlots && (
                    <span style={styles.loadingText}> Loading slots...</span>
                  )}
                </label>

                {!loadingSlots && availableSlots.length === 0 && (
                  <div style={styles.noSlots}>
                    <p style={styles.noSlotsText}>No available slots on this date</p>
                    <p style={styles.noSlotsSub}>Please choose a different date</p>
                  </div>
                )}

                {!loadingSlots && (
                  <div style={styles.slotsGrid}>
                    {allSlots.map(slot => {
                      const isBooked   = bookedSlots.includes(slot)
                      const isSelected = selectedTime === slot
                      const isCurrent  = appointment &&
                                         slot === appointment.time.slice(0,5) &&
                                         selectedDate === appointment.date

                      return (
                        <button
                          key={slot}
                          disabled={isBooked}
                          onClick={() => !isBooked && setSelectedTime(slot)}
                          style={{
                            ...styles.slot,
                            background: isSelected ? '#1D9E75'
                                      : isCurrent  ? '#FAEEDA'
                                      : isBooked   ? '#f5f5f5'
                                      : '#fff',
                            color:      isSelected ? '#fff'
                                      : isCurrent  ? '#854F0B'
                                      : isBooked   ? '#bbb'
                                      : '#333',
                            border:     isSelected ? '2px solid #1D9E75'
                                      : isCurrent  ? '1px solid #EF9F27'
                                      : isBooked   ? '1px solid #eee'
                                      : '1px solid #ddd',
                            cursor:     isBooked   ? 'not-allowed' : 'pointer',
                            textDecoration: isBooked ? 'line-through' : 'none'
                          }}
                        >
                          {slot}
                          {isCurrent && (
                            <span style={styles.currentTag}>current</span>
                          )}
                          {isBooked && !isCurrent && (
                            <span style={styles.bookedTag}>booked</span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
              </>
            )}

            {/* Legend */}
            {selectedDate && !loadingSlots && (
              <div style={styles.legend}>
                <span style={styles.legendItem}>
                  <span style={{...styles.dot, background:'#1D9E75'}}></span>
                  Selected
                </span>
                <span style={styles.legendItem}>
                  <span style={{...styles.dot, background:'#FAEEDA', border:'1px solid #EF9F27'}}></span>
                  Current
                </span>
                <span style={styles.legendItem}>
                  <span style={{...styles.dot, background:'#f5f5f5', border:'1px solid #eee'}}></span>
                  Booked
                </span>
              </div>
            )}

            {/* Buttons */}
            <button
              style={{
                ...styles.btn,
                opacity: (!selectedDate || !selectedTime || saving) ? 0.6 : 1
              }}
              onClick={handleReschedule}
              disabled={!selectedDate || !selectedTime || saving}
            >
              {saving ? 'Saving...' : 'Confirm Reschedule'}
            </button>

            <button
              style={styles.backBtn}
              onClick={() => navigate('/dashboard')}
            >
              Back to Dashboard
            </button>
          </>
        )}

      </div>
    </div>
  )
}

const styles = {
  wrap:        { display:'flex', justifyContent:'center', padding:'24px 16px' },
  card:        { background:'#fff', padding:'32px', borderRadius:'12px', boxShadow:'0 2px 16px rgba(0,0,0,0.1)', width:'100%', maxWidth:'460px' },
  title:       { fontSize:'22px', fontWeight:'600', marginBottom:'20px' },
  currentBox:  { background:'#f9f9f9', borderRadius:'10px', padding:'16px', marginBottom:'8px' },
  currentLabel:{ fontSize:'12px', color:'#aaa', marginBottom:'10px', fontWeight:'500', textTransform:'uppercase', letterSpacing:'0.5px' },
  currentRow:  { display:'flex', alignItems:'center', gap:'10px', marginBottom:'6px' },
  currentIcon: { fontSize:'16px', width:'20px' },
  currentText: { fontSize:'14px', color:'#333', fontWeight:'500' },
  changeLabel: { textAlign:'center', color:'#aaa', fontSize:'13px', margin:'12px 0', position:'relative' },
  label:       { fontSize:'13px', color:'#555', marginBottom:'8px', display:'block', fontWeight:'500' },
  loadingText: { color:'#aaa', fontWeight:'400' },
  input:       { width:'100%', padding:'10px 12px', marginBottom:'16px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'14px', boxSizing:'border-box' },
  slotsGrid:   { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'8px', marginBottom:'12px' },
  slot:        { padding:'8px 4px', borderRadius:'8px', fontSize:'12px', fontWeight:'500', textAlign:'center', transition:'all 0.15s' },
  currentTag:  { display:'block', fontSize:'10px', marginTop:'2px', color:'#854F0B' },
  bookedTag:   { display:'block', fontSize:'10px', marginTop:'2px', color:'#bbb' },
  noSlots:     { background:'#FCEBEB', borderRadius:'8px', padding:'16px', textAlign:'center', marginBottom:'16px' },
  noSlotsText: { color:'#A32D2D', fontWeight:'500', margin:'0 0 4px', fontSize:'14px' },
  noSlotsSub:  { color:'#A32D2D', fontSize:'13px', margin:0 },
  legend:      { display:'flex', gap:'16px', marginBottom:'16px', fontSize:'12px', color:'#666' },
  legendItem:  { display:'flex', alignItems:'center', gap:'6px' },
  dot:         { width:'12px', height:'12px', borderRadius:'50%', display:'inline-block' },
  btn:         { width:'100%', padding:'12px', background:'#1D9E75', color:'#fff', border:'none', borderRadius:'8px', fontSize:'15px', cursor:'pointer', marginBottom:'10px' },
  backBtn:     { width:'100%', padding:'12px', background:'transparent', color:'#1D9E75', border:'1px solid #1D9E75', borderRadius:'8px', fontSize:'15px', cursor:'pointer' },
  successBox:  { background:'#EAF3DE', borderRadius:'10px', padding:'16px', textAlign:'center', marginBottom:'16px' },
  successText: { color:'#3B6D11', fontWeight:'600', fontSize:'16px', margin:'0 0 4px' },
  successSub:  { color:'#3B6D11', fontSize:'13px', margin:0 },
  errorText:   { color:'#A32D2D', fontSize:'13px', marginBottom:'12px', background:'#FCEBEB', padding:'10px 12px', borderRadius:'8px' }
}