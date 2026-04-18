from flask import Blueprint, request, jsonify
from models import db, User, Doctor, Appointment
from flask_jwt_extended import jwt_required, get_jwt

admin_bp = Blueprint('admin', __name__)

def admin_required():
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return False
    return True


@admin_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    if not admin_required():
        return jsonify({'message': 'Admin access required'}), 403

    total_users        = User.query.count()
    total_doctors      = User.query.filter_by(role='doctor').count()
    total_patients     = User.query.filter_by(role='patient').count()
    total_appointments = Appointment.query.count()
    pending            = Appointment.query.filter_by(status='pending').count()
    confirmed          = Appointment.query.filter_by(status='confirmed').count()
    cancelled          = Appointment.query.filter_by(status='cancelled').count()

    return jsonify({
        'total_users':        total_users,
        'total_doctors':      total_doctors,
        'total_patients':     total_patients,
        'total_appointments': total_appointments,
        'pending':            pending,
        'confirmed':          confirmed,
        'cancelled':          cancelled
    })


@admin_bp.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    if not admin_required():
        return jsonify({'message': 'Admin access required'}), 403

    users  = User.query.all()
    result = []
    for u in users:
        doctor = Doctor.query.filter_by(user_id=u.id).first()
        result.append({
            'id':        u.id,
            'name':      u.name,
            'email':     u.email,
            'role':      u.role,
            'specialty': doctor.specialty if doctor else None
        })
    return jsonify(result)


@admin_bp.route('/users/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_user(id):
    if not admin_required():
        return jsonify({'message': 'Admin access required'}), 403

    user = User.query.get_or_404(id)

    if user.role == 'admin':
        return jsonify({'message': 'Cannot delete admin account'}), 400

    # delete related appointments first
    Appointment.query.filter_by(patient_id=id).delete()

    # delete doctor profile if exists
    Doctor.query.filter_by(user_id=id).delete()

    db.session.delete(user)
    db.session.commit()
    print(f'User {id} deleted by admin')
    return jsonify({'message': 'User deleted successfully'})


@admin_bp.route('/appointments', methods=['GET'])
@jwt_required()
def get_all_appointments():
    if not admin_required():
        return jsonify({'message': 'Admin access required'}), 403

    appts  = Appointment.query.all()
    result = []
    for a in appts:
        patient     = User.query.get(a.patient_id)
        doctor      = Doctor.query.get(a.doctor_id)
        doctor_user = User.query.get(doctor.user_id) if doctor else None
        result.append({
            'id':           a.id,
            'patient_name': patient.name     if patient     else 'Unknown',
            'doctor_name':  doctor_user.name if doctor_user else 'Unknown',
            'specialty':    doctor.specialty if doctor      else '',
            'date':         str(a.appointment_date),
            'time':         str(a.appointment_time),
            'status':       a.status
        })
    return jsonify(result)


@admin_bp.route('/appointments/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_appointment(id):
    if not admin_required():
        return jsonify({'message': 'Admin access required'}), 403

    appt = Appointment.query.get_or_404(id)
    db.session.delete(appt)
    db.session.commit()
    return jsonify({'message': 'Appointment deleted'})


@admin_bp.route('/appointments/<int:id>/status', methods=['PATCH'])
@jwt_required()
def update_appointment_status(id):
    if not admin_required():
        return jsonify({'message': 'Admin access required'}), 403

    appt        = Appointment.query.get_or_404(id)
    data        = request.get_json()
    appt.status = data['status']
    db.session.commit()
    return jsonify({'message': 'Status updated'})