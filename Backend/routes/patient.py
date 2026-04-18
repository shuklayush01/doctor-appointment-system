from flask import Blueprint, jsonify
from models import db, User
from flask_jwt_extended import jwt_required, get_jwt_identity

patients_bp = Blueprint('patients', __name__)

@patients_bp.route('/me', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()  # string
    user = User.query.get(int(user_id))
    return jsonify({
        'id':    user.id,
        'name':  user.name,
        'email': user.email,
        'role':  user.role
    })