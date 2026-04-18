from flask import Blueprint, request, jsonify
from models import db, Appointment, User, Doctor
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt

appointments_bp = Blueprint('appointments', __name__)

@appointments_bp.route('/', methods=['POST'])
@jwt_required()
def book():
    try:
        user_id = get_jwt_identity()
        claims  = get_jwt()
        data    = request.get_json()

        print('=== BOOKING ===')
        print('user_id:', user_id)
        print('data:', data)

        if claims.get('role') != 'patient':
            return jsonify({'message': 'Only patients can book appointments'}), 403

        doctor = Doctor.query.get(int(data['doctor_id']))
        if not doctor:
            return jsonify({'message': 'Doctor not found'}), 404

        # ✅ CHECK 1 — prevent double booking for doctor
        existing = Appointment.query.filter_by(
            doctor_id        = int(data['doctor_id']),
            appointment_date = data['date'],
            appointment_time = data['time']
        ).filter(
            Appointment.status != 'cancelled'  # cancelled slots are free again
        ).first()

        if existing:
            print('Slot already booked!')
            return jsonify({
                'message': f"This time slot is already booked. Please choose a different time."
            }), 409

        # ✅ CHECK 2 — prevent same patient booking same doctor same day
        patient_existing = Appointment.query.filter_by(
            patient_id       = int(user_id),
            doctor_id        = int(data['doctor_id']),
            appointment_date = data['date']
        ).filter(
            Appointment.status != 'cancelled'
        ).first()

        if patient_existing:
            print('Patient already has booking with this doctor today!')
            return jsonify({
                'message': 'You already have an appointment with this doctor on this date.'
            }), 409

        # ✅ All checks passed — save the appointment
        appt = Appointment(
            patient_id       = int(user_id),
            doctor_id        = int(data['doctor_id']),
            appointment_date = data['date'],
            appointment_time = data['time'],
            status           = 'pending'
        )
        db.session.add(appt)
        db.session.commit()
        print('Booked! appt id:', appt.id)
        return jsonify({'message': 'Appointment booked successfully!', 'id': appt.id}), 201

    except Exception as e:
        db.session.rollback()
        print('Error:', str(e))
        return jsonify({'message': str(e)}), 500


@appointments_bp.route('/mine', methods=['GET'])
@jwt_required()
def my_appointments():
    user_id = get_jwt_identity()
    appts   = Appointment.query.filter_by(patient_id=int(user_id)).all()
    result  = []
    for a in appts:
        doctor      = Doctor.query.get(a.doctor_id)
        doctor_user = User.query.get(doctor.user_id) if doctor else None
        result.append({
            'id':          a.id,
            'doctor_id':   a.doctor_id,
            'doctor_name': doctor_user.name if doctor_user else 'Unknown',
            'specialty':   doctor.specialty  if doctor      else '',
            'date':        str(a.appointment_date),
            'time':        str(a.appointment_time),
            'status':      a.status
        })
    return jsonify(result)


@appointments_bp.route('/doctor', methods=['GET'])
@jwt_required()
def doctor_appointments():
    user_id = get_jwt_identity()
    claims  = get_jwt()

    if claims.get('role') != 'doctor':
        return jsonify({'message': 'Access denied'}), 403

    doctor = Doctor.query.filter_by(user_id=int(user_id)).first()
    if not doctor:
        return jsonify({'message': 'Doctor profile not found'}), 404

    appts  = Appointment.query.filter_by(doctor_id=doctor.id).all()
    result = []
    for a in appts:
        patient = User.query.get(a.patient_id)
        result.append({
            'id':           a.id,
            'patient_name': patient.name if patient else 'Unknown',
            'patient_id':   a.patient_id,
            'date':         str(a.appointment_date),
            'time':         str(a.appointment_time),
            'status':       a.status
        })
    print('Doctor', doctor.id, 'has', len(result), 'appointments')
    return jsonify(result)


@appointments_bp.route('/available-slots', methods=['GET'])
def available_slots():
    doctor_id = request.args.get('doctor_id')
    date      = request.args.get('date')

    if not doctor_id or not date:
        return jsonify({'message': 'doctor_id and date required'}), 400

    # all possible time slots
    all_slots = [
        '09:30', '10:00', '11:00',
        '12:00', '14:00', '15:00', '16:00'
    ]

    # find already booked slots for this doctor on this date
    booked = Appointment.query.filter_by(
        doctor_id        = int(doctor_id),
        appointment_date = date
    ).filter(
        Appointment.status != 'cancelled'
    ).all()

    booked_times = [str(a.appointment_time)[:5] for a in booked]

    available = [s for s in all_slots if s not in booked_times]

    return jsonify({
        'date':      date,
        'doctor_id': doctor_id,
        'available': available,
        'booked':    booked_times
    })


@appointments_bp.route('/<int:id>/status', methods=['PATCH'])
@jwt_required()
def update_status(id):
    appt        = Appointment.query.get_or_404(id)
    data        = request.get_json()
    old_status  = appt.status
    appt.status = data['status']
    db.session.commit()
    return jsonify({'message': f"Appointment {data['status']}!"})


@appointments_bp.route('/<int:id>/reschedule', methods=['PATCH'])
@jwt_required()
def reschedule(id):
    try:
        user_id = get_jwt_identity()
        data    = request.get_json()

        print('=== RESCHEDULE ===')
        print('user_id:', user_id)
        print('data:', data)

        appt = Appointment.query.get_or_404(id)

        # make sure this appointment belongs to this patient
        if str(appt.patient_id) != str(user_id):
            return jsonify({'message': 'You can only reschedule your own appointments'}), 403

        # cannot reschedule cancelled appointments
        if appt.status == 'cancelled':
            return jsonify({'message': 'Cannot reschedule a cancelled appointment'}), 400

        # check new slot is not already booked
        existing = Appointment.query.filter_by(
            doctor_id        = appt.doctor_id,
            appointment_date = data['date'],
            appointment_time = data['time']
        ).filter(
            Appointment.status != 'cancelled',
            Appointment.id != id  # exclude current appointment
        ).first()

        if existing:
            return jsonify({'message': 'This time slot is already booked. Please choose a different time.'}), 409

        # update the appointment
        old_date = str(appt.appointment_date)
        old_time = str(appt.appointment_time)

        appt.appointment_date = data['date']
        appt.appointment_time = data['time']
        appt.status           = 'pending'  # reset to pending after reschedule
        db.session.commit()

        print(f'Rescheduled from {old_date} {old_time} to {data["date"]} {data["time"]}')
        return jsonify({'message': 'Appointment rescheduled successfully!'}), 200

    except Exception as e:
        db.session.rollback()
        print('Reschedule error:', str(e))
        return jsonify({'message': str(e)}), 500