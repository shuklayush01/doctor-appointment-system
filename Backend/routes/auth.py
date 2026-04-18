from flask import Blueprint, request, jsonify
from models import db, User
from flask_jwt_extended import create_access_token
import bcrypt

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    print('=== REGISTER ===')
    print('Data:', data)

    if not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Email and password required'}), 400

    existing = User.query.filter_by(email=data['email']).first()
    if existing:
        return jsonify({'message': 'Email already exists'}), 400

    hashed = bcrypt.hashpw(
        data['password'].encode('utf-8'),
        bcrypt.gensalt()
    ).decode('utf-8')

    print('Password hashed successfully')

    user = User(
        name          = data['name'],
        email         = data['email'],
        password_hash = hashed,
        role          = data.get('role', 'patient')
    )
    db.session.add(user)
    db.session.commit()
    print('User saved:', user.email, '| id:', user.id)
    return jsonify({'message': 'User registered successfully'}), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    print('=== LOGIN ===')
    print('Email:', data.get('email'))
    print('Password received:', data.get('password'))

    user = User.query.filter_by(email=data['email']).first()

    if not user:
        print('ERROR: User not found')
        return jsonify({'message': 'Email not found'}), 401

    print('User found:', user.email)
    print('Hash in DB:', user.password_hash)
    print('Hash length:', len(user.password_hash))

    try:
        password_ok = bcrypt.checkpw(
            data['password'].encode('utf-8'),
            user.password_hash.encode('utf-8')
        )
        print('Password match:', password_ok)
    except Exception as e:
        print('bcrypt error:', str(e))
        return jsonify({'message': 'Password check failed: ' + str(e)}), 500

    if not password_ok:
        return jsonify({'message': 'Wrong password'}), 401

    token = create_access_token(
        identity=str(user.id),
        additional_claims={
            'role': user.role,
            'name': user.name
        }
    )

    print('Login success! Token created for:', user.name)
    return jsonify({
        'token': token,
        'role':  user.role,
        'name':  user.name
    }), 200