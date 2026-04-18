import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import API from '../api/axios'

export default function BookAppointment() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const [doctor,          setDoctor]          = useState(null)
  const [selectedDate,    setSelectedDate]    = useState('')
  const [availableSlots,  setAvailableSlots]  = useState([])
  const [bookedSlots,     setBookedSlots]     = useState([])
  const [selectedTime,    setSelectedTime]    = useState('')
  const [loadingSlots,    setLoadingSlots]    = useState(false)
  const [booking,         setBooking]         = useState(false)
  const [msg,             setMsg]             = useState('')
  const [error,           setError]           = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { navigate('/login'); return }
    API.get(`/doctors/${id}`)
      .then(res => setDoctor(res.data))
      .catch(err => console.log('Doctor error:', err))
  }, [id])

  // fetch available slots when date changes
  useEffect(() => {
    if (!selectedDate) return
    setLoadingSlots(true)
    setSelectedTime('')
    setAvailableSlots([])

    API.get(`/appointments/available-slots?doctor_id=${id}&date=${selectedDate}`)
      .then(res => {
        console.log('Slots:', res.data)
        setAvailableSlots(res.data.available)
        setBookedSlots(res.data.booked)
      })
      .catch(err => console.log('Slots error:', err))
      .finally(() => setLoadingSlots(false))
  }, [selectedDate])

  const handleBook = async () => {
    if (!selectedDate || !selectedTime) {
      setError('Please select a date and a time slot')
      return
    }

    try {
      setBooking(true)
      setError('')
      const res = await API.post('/appointments/', {
        doctor_id: parseInt(id),
        date:      selectedDate,
        time:      selectedTime
      })
      setMsg('Appointment booked successfully!')
      setTimeout(() => navigate('/dashboard'), 2000)
    } catch (err) {
      console.log('Booking error:', err.response?.data)
      setError(err.response?.data?.message || 'Booking failed')
    } finally {
      setBooking(false)
    }
  }

  // get today's date for min date
  const today = new Date().toISOString().split('T')[0]

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>

        <h2 style={styles.title}>Book Appointment</h2>

        {/* Doctor info */}
        {doctor && (
          <div style={styles.doctorBox}>
            <div style={styles.avatar}>{doctor.name[0]}</div>
            <div>
              <p style={styles.docName}>{doctor.name}</p>
              <p style={styles.docSpec}>{doctor.specialty}</p>
            </div>
          </div>
        )}

        {/* Success message */}
        {msg && (
          <div style={styles.successBox}>
            <p style={styles.successText}>Appointment booked successfully!</p>
            <p style={styles.successSub}>Redirecting to dashboard...</p>
          </div>
        )}

        {/* Error message */}
        {error && <p style={styles.errorText}>{error}</p>}

        {!msg && (
          <>
            {/* Date picker */}
            <label style={styles.label}>Select Date</label>
            <input
              style={styles.input}
              type="date"
              min={today}
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
            />

            {/* Time slots */}
            {selectedDate && (
              <>
                <label style={styles.label}>
                  Select Time Slot
                  {loadingSlots && (
                    <span style={styles.loadingText}> Loading slots...</span>
                  )}
                </label>

                {!loadingSlots && availableSlots.length === 0 && (
                  <div style={styles.noSlots}>
                    <p style={styles.noSlotsText}>
                      No available slots for this date.
                    </p>
                    <p style={styles.noSlotsSub}>
                      Please choose a different date.
                    </p>
                  </div>
                )}

                {!loadingSlots && availableSlots.length > 0 && (
                  <div style={styles.slotsGrid}>
                    {/* show all slots — available and booked */}
                    {[
                      '09:00','09:30','10:00','10:30','11:00','11:30',
                      '12:00','14:00','14:30','15:00','15:30','16:00','16:30'
                    ].map(slot => {
                      const isBooked    = bookedSlots.includes(slot)
                      const isSelected  = selectedTime === slot
                      const isAvailable = availableSlots.includes(slot)

                      return (
                        <button
                          key={slot}
                          disabled={isBooked}
                          onClick={() => !isBooked && setSelectedTime(slot)}
                          style={{
                            ...styles.slot,
                            background:  isSelected  ? '#1D9E75'
                                       : isBooked    ? '#f5f5f5'
                                       : '#fff',
                            color:       isSelected  ? '#fff'
                                       : isBooked    ? '#bbb'
                                       : '#333',
                            border:      isSelected  ? '2px solid #1D9E75'
                                       : isBooked    ? '1px solid #eee'
                                       : '1px solid #ddd',
                            cursor:      isBooked    ? 'not-allowed' : 'pointer',
                            textDecoration: isBooked ? 'line-through' : 'none'
                          }}
                        >
                          {slot}
                          {isBooked && (
                            <span style={styles.bookedTag}>Booked</span>
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
                  <span style={{...styles.dot, background:'#fff', border:'1px solid #ddd'}}></span>
                  Available
                </span>
                <span style={styles.legendItem}>
                  <span style={{...styles.dot, background:'#f5f5f5', border:'1px solid #eee'}}></span>
                  Booked
                </span>
              </div>
            )}

            {/* Book button */}
            <button
              style={{
                ...styles.btn,
                opacity: (!selectedDate || !selectedTime || booking) ? 0.6 : 1
              }}
              onClick={handleBook}
              disabled={!selectedDate || !selectedTime || booking}
            >
              {booking ? 'Booking...' : 'Confirm Booking'}
            </button>

            <button style={styles.backBtn} onClick={() => navigate('/doctors')}>
              Back to Doctors
            </button>
          </>
        )}

      </div>
    </div>
  )
}

const styles = {
  wrap:        { display:'flex', justifyContent:'center', alignItems:'flex-start', minHeight:'80vh', padding:'24px 16px' },
  card:        { background:'#fff', padding:'32px', borderRadius:'12px', boxShadow:'0 2px 16px rgba(0,0,0,0.1)', width:'100%', maxWidth:'460px' },
  title:       { fontSize:'22px', fontWeight:'600', marginBottom:'20px' },
  doctorBox:   { display:'flex', alignItems:'center', gap:'12px', background:'#f9f9f9', padding:'12px', borderRadius:'10px', marginBottom:'20px' },
  avatar:      { width:'44px', height:'44px', borderRadius:'50%', background:'#1D9E75', color:'#fff', fontSize:'20px', fontWeight:'600', display:'flex', alignItems:'center', justifyContent:'center' },
  docName:     { fontWeight:'600', fontSize:'15px', margin:'0 0 2px' },
  docSpec:     { fontSize:'13px', color:'#1D9E75', margin:0 },
  label:       { fontSize:'13px', color:'#555', marginBottom:'8px', display:'block', fontWeight:'500' },
  loadingText: { color:'#aaa', fontWeight:'400' },
  input:       { width:'100%', padding:'10px 12px', marginBottom:'16px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'14px', boxSizing:'border-box' },
  slotsGrid:   { display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'8px', marginBottom:'16px' },
  slot:        { padding:'8px 4px', borderRadius:'8px', fontSize:'13px', fontWeight:'500', textAlign:'center', transition:'all 0.15s', position:'relative' },
  bookedTag:   { display:'block', fontSize:'10px', color:'#bbb', marginTop:'2px' },
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