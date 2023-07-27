from flask import Flask, request, render_template
from flask_restful import Api, Resource
from bs4 import BeautifulSoup
from datetime import datetime
import sqlite3
import json
import requests


def create_all_tables():
    db = sqlite3.connect("./data/app.db")
    cr = db.cursor()
    cr.execute("""
        CREATE TABLE IF NOT EXISTS dollar_price (
            dollar_price INT NOT NULL,
            dollar_price_date TEXT
        )
    """)
    cr.execute(
        "CREATE TABLE IF NOT EXISTS cases(case_id INTEGER PRIMARY KEY AUTOINCREMENT,case_title TEXT)"
    )
    cr.execute("""
        CREATE TABLE IF NOT EXISTS patients (
            patient_id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_name TEXT,
            birth TEXT,
            phone TEXT,
            gender TEXT
        )
    """)
    cr.execute("""
        CREATE TABLE IF NOT EXISTS appointments (
            appointment_id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id INTEGER NOT NULL,
            appointment_date TEXT,
            appointment_time TEXT,
            FOREIGN KEY (patient_id) REFERENCES patients (patient_id)
        )   
    """)
    cr.execute("""
        CREATE VIEW IF NOT EXISTS get_all_appointments
        AS
        SELECT 
            appointment_id,appointments.patient_id,patient_name,appointment_date,appointment_time 
        FROM 
            appointments
        LEFT JOIN
            patients
        WHERE
            patients.patient_id = appointments.patient_id
    """)
    cr.execute("""
        CREATE TABLE IF NOT EXISTS transactions (
            transaction_id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id INTEGER NOT NULL,
            case_id INTEGER NOT NULL,
            transaction_date TEXT NOT NULL,
            transaction_time TEXT NOT NULL,
            amount INTEGER,
            rate INTEGER,
            amount_type TEXT,
            notes TEXT,
        FOREIGN KEY (patient_id) REFERENCES patients (patient_id),
        FOREIGN KEY (case_id) REFERENCES cases (case_id)
    )
    """)
    db.commit()
    db.close()


def get_dollar_price_liira():
    try:
        url = "https://liira-sy.com/"
        req = requests.get(url).content
        soup = BeautifulSoup(req, "lxml")
        dollar_price = soup.select(
            ".boxprices .boxprices__row > .col:first-of-type > div > p:nth-of-type(2)")
        return int(dollar_price[0].text.strip())
    except:
        return 0


def get_dollar_price_lirat():
    try:
        url = "https://lirat.org/wp-json/alba-cur/cur/1.json"
        req = requests.get(url).json()
        return int(req[0]["bid"])
    except:
        return 0


def get_dollar_price():
    if get_dollar_price_lirat() == 0:
        return get_dollar_price_liira()
    else:
        return get_dollar_price_lirat()


def add_dollar_price_db(price):
    today = datetime.strftime(datetime.now(), "%Y-%m-%d")
    db = sqlite3.connect("./data/app.db")
    cr = db.cursor()
    cr.execute(
        "SELECT * FROM dollar_price ORDER BY dollar_price_date DESC LIMIT 1")
    data = cr.fetchall()
    if data and data[0] != (price, today):
        cr.execute(
            "INSERT INTO dollar_price(dollar_price,dollar_price_date) VALUES (?,?)", (price, today))
    db.commit()
    db.close()


def add_new_patient_db(id, patient_name, birth, phone, gender):
    db = sqlite3.connect("./data/app.db")
    cr = db.cursor()
    if id:
        cr.execute("SELECT patient_id from patients")
        patient_ids = [i[0] for i in cr.fetchall()]
        if int(id) in patient_ids:
            cr.execute("""
            UPDATE 
                patients 
            SET 
                patient_name = ?,
                birth = ?,
                phone = ?,
                gender = ?
            WHERE
                patient_id = ?
            """, (patient_name, birth, phone, gender, id))
    else:
        cr.execute("""
            INSERT INTO patients(patient_name,birth,phone,gender) VALUES (?,?,?,?)
        """, (patient_name, birth, phone, gender))
    db.commit()
    db.close()


def get_all_patients_db():
    db = sqlite3.connect("./data/app.db")
    cr = db.cursor()
    cr.execute("""
        SELECT * FROM patients ORDER BY patients.patient_name
    """)
    result = cr.fetchall()
    db.commit()
    db.close()
    return result


def add_new_appointment_db(appointment_id, patient_id, appointment_date, appointment_time):
    db = sqlite3.connect("./data/app.db")
    cr = db.cursor()
    if appointment_id:
        cr.execute("SELECT appointment_id FROM appointments")
        appointment_ids = [i[0] for i in cr.fetchall()]
        if int(appointment_id) in appointment_ids:
            cr.execute("""
            UPDATE
                appointments
            SET
                patient_id = ?,
                appointment_date = ?,
                appointment_time = ?
            WHERE
                appointment_id = ?
            """, (patient_id, appointment_date, appointment_time, appointment_id))
    else:
        cr.execute("""
            INSERT INTO appointments(patient_id, appointment_date, appointment_time) VALUES (?,?,?)
        """, (patient_id, appointment_date, appointment_time))
    db.commit()
    db.close()


def delete_appointment(id):
    db = sqlite3.connect("./data/app.db")
    cr = db.cursor()
    cr.execute("DELETE FROM appointments WHERE appointment_id = (?)", (int(id),))
    db.commit()
    db.close()


def get_all_appointments_db():
    db = sqlite3.connect("./data/app.db")
    cr = db.cursor()
    cr.execute(
        "SELECT * FROM get_all_appointments ORDER BY appointment_date ASC,appointment_time ASC")
    data = cr.fetchall()
    db.commit()
    db.close()
    return data


def add_new_case(case_id, case_title):
    db = sqlite3.connect("./data/app.db")
    cr = db.cursor()
    if case_id:
        cr.execute("SELECT case_id FROM cases")
        case_ids = [i[0] for i in cr.fetchall()]
        if int(case_id) in case_ids:
            cr.execute("""
            UPDATE
                cases
            SET
                case_title = ?,
            WHERE
                case_id = ?
            """, (case_title, case_id))
    else:
        cr.execute("""
            INSERT INTO cases(case_title) VALUES (?)
        """, (case_title, ))
    db.commit()
    db.close()


def get_all_cases_db():
    db = sqlite3.connect("./data/app.db")
    cr = db.cursor()
    cr.execute(
        "SELECT * FROM cases")
    data = cr.fetchall()
    db.commit()
    db.close()
    return data


def add_new_transaction_db(
    transaction_id,
    patient_id,
    case_id,
    transaction_date,
    transaction_time,
    amount,
    rate,
    amount_type,
    notes
):
    db = sqlite3.connect("./data/app.db")
    cr = db.cursor()
    if transaction_id:
        cr.execute("SELECT transaction_id FROM transactions")
        transaction_ids = [i[0] for i in cr.fetchall()]
        if int(transaction_id) in transaction_ids:
            cr.execute("""
            UPDATE 
                transactions 
            SET 
                patient_id = ?,
                case_id = ?,
                transaction_date = ?,
                transaction_time = ?,
                amount = ?,
                rate = ?,
                amount_type = ?,
                notes = ?
            WHERE
                transaction_id = ?
            """,
                       (
                           patient_id,
                           case_id,
                           transaction_date,
                           transaction_time,
                           amount,
                           rate,
                           amount_type,
                           notes,
                           transaction_id
                       ))
    else:
        cr.execute("""
        INSERT INTO transactions (
            patient_id,
            case_id,
            transaction_date,
            transaction_time,
            amount,
            rate,
            amount_type,
            notes
        )
        VALUES (?,?,?,?,?,?,?,?)
        """,
                   (
                       patient_id,
                       case_id,
                       transaction_date,
                       transaction_time,
                       amount,
                       rate,
                       amount_type,
                       notes
                   ))
    db.commit()
    db.close()


def get_patient_transactions_db(id):
    db = sqlite3.connect("./data/app.db")
    cr = db.cursor()
    if id:
        cr.execute("""
        SELECT 
            transactions.transaction_id,
            transactions.patient_id,
            patients.patient_name,
            transactions.case_id,
            cases.case_title,
            transactions.transaction_date,
            transactions.transaction_time,
            transactions.amount,
            transactions.rate,
            transactions.amount_type,
            transactions.notes
        FROM
            transactions
        LEFT JOIN 
            patients 
        ON 
            patients.patient_id = transactions.patient_id
        LEFT JOIN 
            cases 
        ON 
            cases.case_id = transactions.case_id
        WHERE
            transactions.patient_id = ?
        ORDER BY
            transactions.transaction_date ASC,
            transactions.transaction_time ASC
        """, (id,))
    else:
        cr.execute("""
        SELECT 
            transactions.transaction_id,
            transactions.patient_id,
            patients.patient_name,
            transactions.case_id,
            cases.case_title,
            transactions.transaction_date,
            transactions.transaction_time,
            transactions.amount,
            transactions.rate,
            transactions.amount_type,
            transactions.notes
        FROM
            transactions
        LEFT JOIN 
            patients 
        ON 
            patients.patient_id = transactions.patient_id
        LEFT JOIN 
            cases 
        ON 
            cases.case_id = transactions.case_id
        ORDER BY
            transactions.transaction_date DESC,
            transactions.transaction_time DESC
        """)
    data = cr.fetchall()
    db.commit()
    db.close()
    return data


def delete_transaction_db(id):
    db = sqlite3.connect("./data/app.db")
    cr = db.cursor()
    cr.execute("DELETE FROM transactions WHERE transaction_id = ?", (id,))
    db.commit()
    db.close()


app = Flask(__name__)
api = Api(app)


class Dollar(Resource):
    def get(self):
        price = get_dollar_price()
        add_dollar_price_db(price)
        return json.dumps({"response": price})


class Patient(Resource):
    def get(self):
        return get_all_patients_db()

    def post(self):
        data = request.get_json()["result"]
        id, patient_name, birth, phone, gender = list(data.values())
        add_new_patient_db(id, patient_name, birth, phone, gender)
        return json.dumps({"response": "Patient has been added"})


class Appointment(Resource):
    def get(self):
        return get_all_appointments_db()

    def post(self):
        data = request.get_json()["result"]
        appointment_id, patient_id, appointment_date, appointment_time = list(
            data.values())
        add_new_appointment_db(appointment_id, patient_id,
                               appointment_date, appointment_time)
        return json.dumps({"response": "Appointment has been added"})

    def delete(self):
        appointment_id = request.get_json()["result"]
        delete_appointment(appointment_id)
        return "Appointment has been deleted"


class Case(Resource):
    def get(self):
        return get_all_cases_db()

    def post(self):
        data = request.get_json()["result"]
        case_id, case_title = list(data.values())
        add_new_case(case_id, case_title)
        return "Case has been Added"


class Transaction(Resource):
    def put(self):
        id = request.get_json()["result"]
        data = get_patient_transactions_db(id)
        return json.dumps({"result": data})

    def post(self):
        data = request.get_json()["result"]
        transaction_id, patient_id, case_id, transaction_date, transaction_time, amount, rate, amount_type, notes = list(
            data.values())
        add_new_transaction_db(
            transaction_id,
            patient_id,
            case_id,
            transaction_date,
            transaction_time,
            amount,
            rate,
            amount_type,
            notes
        )
        return "Transaction has been Added"

    def delete(self):
        id = request.get_json()['result']
        delete_transaction_db(id)


api.add_resource(Dollar, "/dollar")
api.add_resource(Patient, "/patient")
api.add_resource(Appointment, "/appointment")
api.add_resource(Case, "/cases")
api.add_resource(Transaction, "/transactions")


@app.route("/")
def index():
    return render_template("index.html")


@app.after_request
def add_header(response):
    """
    Add headers to both force latest IE rendering engine or Chrome Frame,
    and also to cache the rendered page for 10 minutes.
    """
    response.headers['X-UA-Compatible'] = 'IE=Edge,chrome=1'
    response.headers['Cache-Control'] = 'public, max-age=0'
    return response


if __name__ == "__main__":
    create_all_tables()
    app.run(debug=True, port=8500)
