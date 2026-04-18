# DocBook — Doctor Appointment System

A full stack web application for booking doctor appointments.

##  Live Demo
- Frontend: https://docbook.vercel.app
- Backend API: https://docbook-backend.onrender.com

##  Tech Stack
- **Frontend:** React, Vite, Axios, React Router
- **Backend:** Python, Flask, SQLAlchemy, JWT
- **Database:** MySQL
- **Hosting:** Vercel (frontend), Render (backend), Aiven (database)

##  Features
- Patient and doctor registration and login
- JWT based authentication
- Book appointments with available time slots
- Prevent double booking
- Reschedule appointments
- Doctor dashboard to confirm or cancel appointments
- Admin panel with full system control
- Role based access (patient, doctor, admin)

##  Run locally

### Backend
cd Backend
pip install -r requirements.txt
python app.py

### Frontend
cd frontend
npm install
npm run dev
