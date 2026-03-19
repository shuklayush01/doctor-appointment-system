import sys
from Db import DBhelper

class APP:

    def __init__(self):
        self.database = DBhelper()
        self.Menu()

    def Menu(self):
        while True:
            user_input = input(
                "\nEnter 0 Register Patients\n"
                "Enter 1 View Doctor\n"
                "Enter 2 Search Patients\n"
                "Enter 3 Book Appointments\n"
                "Enter 4 Search Doctor\n"
                "Press any key to EXIT\n"
            )
            if  user_input == '0':
                self.RegisterP()
            elif user_input == "1":
                self.ViewDoctor()

            elif user_input == "2":
                self.SearchPatients()

            elif user_input == "3":
                self.BookAppointment()

            else:
                sys.exit(0)

      # register patients
    def RegisterP (self) :
        PName = input("Enter Name : ")
        Pid = int(input("Enter ID :"))
        Age = int(input("Enter Age :")) 
        Phone = input("Enter Phone NO : ")
        Gender =input("Gender : ")
        Email =input("Email : ")

        response = self.database.AddPatients(  Pid ,PName , Age , Phone  , Gender , Email )

        if response==1:
          print(" Patient SUCESSFULLY ")
        else:
          print("Patient RESGISTRATION FAILED")

        user_inpu = input( " Enter 1 To GO MENU Again Else to Exit" )
        if user_inpu == "1":
            self.Menu()
        else :
            sys.exit(0)
    
        # view doctor
    def ViewDoctor(self):
    
        print( "\n---View Doctor---\n")

        data = self.database.ViewDoctor()

        print("\n--- Doctor List ---")
        for doctor in data:
            print("Doctor Name:", doctor[1], "| Specialization:", doctor[2])
      
        user_inpu = input( " Enter 1 To GO MENU Again Else to Exit" )
        if user_inpu == "1":
            self.Menu()
        else :
            sys.exit(0)
    # search patient
    def SearchPatients(self):

        print( "\n---Search Patients---\n")
        name = input("Enter Name: ")
        patient_id = input("Enter Id: ")

        data = self.database.SearchPatients(patient_id, name)

        if len(data) == 0:
            print(" Incorrect patient details")
        else:
            print("\n Patient Found")
        user_inpu = input( " Enter 1 To GO MENU Again Else to Exit" )
        if user_inpu == "1":
            self.Menu()
        else :
            sys.exit(0)
    def BookAppointment(self):

        print("\n--- Book Appointment ---")

        patient_id = input("Enter Patient ID: ")

        data = self.database.SearchPatients(patient_id, "")

        if len(data) == 0:
            print("Patient not found. Register first.")
            self.RegisterP()
            return

        doctor_id = input("Enter Doctor ID: ")
        date = input("Enter Date (YYYY-MM-DD): ")
        time = input("Enter Time (HH:MM:SS): ")

        result = self.database.BookAppointment(patient_id, doctor_id, date, time)

        if result == 1:
            print("Appointment Booked Successfully")
        else:
            print("Appointment Failed")
user1 = APP()