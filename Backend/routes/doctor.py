from flask import Blueprint, jsonify
from models import db, Doctor, User

doctors_bp = Blueprint('doctors', __name__)

@doctors_bp.route('/', methods=['GET'])
def get_doctors():
    doctors = Doctor.query.all()
    result  = []
    for d in doctors:
        user = User.query.get(d.user_id)
        if user:
            result.append({
                'id':        d.id,
                'user_id':   d.user_id,
                'name':      user.name,
                'specialty': d.specialty,
                'bio':       d.bio
            })
    print('Doctors returned:', len(result))
    return jsonify(result)

@doctors_bp.route('/<int:id>', methods=['GET'])
def get_doctor(id):
    d    = Doctor.query.get_or_404(id)
    user = User.query.get(d.user_id)
    return jsonify({
        'id':        d.id,
        'user_id':   d.user_id,
        'name':      user.name,
        'specialty': d.specialty,
        'bio':       d.bio
    })