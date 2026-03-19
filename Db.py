import mysql.connector

class DBhelper:

    def __init__(self):
        try:
            self.conn = mysql.connector.connect(
                host="localhost",
                user="root",
                password="",
                database="doctor_appointment"
            )
            self.mycursor = self.conn.cursor()

        except:
            print("Database Connection Error")

        else:
            print("Connected to database")


    def ViewDoctor(self):
        self.mycursor.execute("SELECT * FROM doctor")
        return self.mycursor.fetchall()


    def SearchPatients(self, id, name):
        self.mycursor.execute(
        "SELECT * FROM patients WHERE Patients_id=%s AND Name LIKE %s",
        (id, "%" + name + "%")
)
        return self.mycursor.fetchall()


    def AddPatients(self, id, name, age, phone, gender, email):

        try:
            query = """
            INSERT INTO patients
            (Patients_id, Name, Age, Phone_Number, Gender, Email)
            VALUES (%s,%s,%s,%s,%s,%s)
            """

            self.mycursor.execute(query, (id, name, age, phone, gender, email))
            self.conn.commit()
            return 1

        except Exception as e:
            print("Database Error:", e)
            return -1

    def BookAppointment(self, patient_id, doctor_id, date, time):
        try:
            # Check availability
            check_query = """
            SELECT * FROM appointment 
            WHERE doctor_id=%s AND appointment_date=%s AND appointment_time=%s
            """
            self.mycursor.execute(check_query, (doctor_id, date, time))
            result = self.mycursor.fetchall()

            if result:
                return 0  # Slot already booked

            # Book appointment
            query = """
            INSERT INTO appointment
            (patient_id, doctor_id, appointment_date, appointment_time)
            VALUES (%s,%s,%s,%s)
            """

            self.mycursor.execute(query, (patient_id, doctor_id, date, time))
            self.conn.commit()

            return 1

        except Exception as e:
            print("Database Error:", e)
            return -1
        
        def ViewAppointments(self):
            self.mycursor.execute("SELECT * FROM appointment")
            return self.mycursor.fetchall()