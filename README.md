# 🎓 EduVerse LMS — Full-Stack College Learning Management System

> **A production-ready, full-stack relational Learning Management System (LMS) engineered for college DBMS academic projects and modern university administration.**

---

## 🌟 Overview & System Highlights

EduVerse LMS is a full-stack web application designed with a **MySQL 8+ normalized database**, a robust **Python Flask REST API**, and a modern **React + TypeScript + Vite + Tailwind CSS** frontend.

It provides role-based portals for **Students**, **Faculty**, and **Administrators**, featuring automated quiz evaluation, assignment submission & grading pipelines, batch attendance registers with 75% shortage enforcement, and relational analytical DBMS reports.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts, Axios, React Router v6 |
| **Backend** | Python 3.10+, Flask, Flask-JWT-Extended (Role-Based Access Control), Flask-SQLAlchemy, Flask-CORS, Bcrypt |
| **Database** | MySQL 8.0+ (InnoDB engine with Foreign Keys, Check Constraints, Composite Unique Keys, B-Tree Indexes) |
| **Architecture** | RESTful API, ACID Database Transactions, Atomic Grading & Evaluation Pipeline |

---

## 🔐 Default Demo Accounts

All demo accounts are pre-seeded with the password: `Password123!`

| Role | Email | Password | Access Details |
|---|---|---|---|
| 🛡️ **Administrator** | `admin@lms.edu` | `Password123!` | Full University Console, User Management, DBMS Analytical Reports |
| 🎓 **Faculty 1** | `dr.alan@lms.edu` | `Password123!` | Department of Computer Science (Dr. Alan Turing) |
| 🎓 **Faculty 2** | `dr.grace@lms.edu` | `Password123!` | Department of Information Technology (Dr. Grace Hopper) |
| 🎓 **Faculty 3** | `dr.ada@lms.edu` | `Password123!` | Department of Computer Science (Dr. Ada Lovelace) |
| 🧑‍🎓 **Student 1** | `student1@lms.edu` | `Password123!` | Computer Science, Year 3, Semester 5 (Alex Johnson) |
| 🧑‍🎓 **Student 2** | `student2@lms.edu` | `Password123!` | Computer Science, Year 3, Semester 5 (Brian Smith) |
| 🧑‍🎓 **Student 3** | `student3@lms.edu` | `Password123!` | Information Technology, Year 2, Semester 3 (Catherine Lee) |

*(Quick 1-click login buttons are also available directly on the Login page!)*

---

## 📊 Database Architecture (16 Normalized Tables)

```mermaid
erDiagram
    USERS ||--o| STUDENTS : "1-to-1 profile"
    USERS ||--o| FACULTY : "1-to-1 profile"
    USERS ||--o{ NOTIFICATIONS : receives
    FACULTY ||--o{ COURSES : teaches
    FACULTY ||--o{ ANNOUNCEMENTS : publishes
    COURSES ||--o{ ENROLLMENTS : registers
    STUDENTS ||--o{ ENROLLMENTS : joins
    COURSES ||--o{ COURSE_MATERIALS : contains
    COURSES ||--o{ ASSIGNMENTS : contains
    COURSES ||--o{ QUIZZES : schedules
    COURSES ||--o{ ATTENDANCE : tracks
    STUDENTS ||--o{ ATTENDANCE : logs
    ASSIGNMENTS ||--o{ SUBMISSIONS : receives
    STUDENTS ||--o{ SUBMISSIONS : submits
    QUIZZES ||--o{ QUESTIONS : contains
    QUESTIONS ||--o{ OPTIONS : has
    QUIZZES ||--o{ QUIZ_ATTEMPTS : attempts
    STUDENTS ||--o{ QUIZ_ATTEMPTS : takes
    QUIZ_ATTEMPTS ||--o{ ANSWERS : records
```

### Table Breakdown:
1. `users`: Authentication identities, encrypted password hashes (bcrypt), roles (`student`, `faculty`, `admin`), active status flags.
2. `students`: Extended student profiles, roll numbers (`student_number`), department, year, semester.
3. `faculty`: Extended professor profiles, employee ID (`faculty_number`), department, designation.
4. `courses`: Course curricula, unique `course_code`, title, description, syllabus, credit units, semester, department, instructor foreign key.
5. `enrollments`: Course registrations with composite unique constraint `(student_id, course_id)` and status (`active`, `completed`, `dropped`).
6. `course_materials`: Downloadable lecture slides, notes, PDFs, source code files.
7. `assignments`: Course homework/projects with `due_date`, `max_marks`, and professor instructions.
8. `submissions`: Student deliverables with status (`submitted`, `late`, `graded`), file upload paths, numeric marks, and feedback.
9. `quizzes`: Timed online assessments with `duration_minutes` and `max_marks`.
10. `questions`: Multiple-choice question bank per quiz with custom point values.
11. `options`: Multiple choice answers (A, B, C, D) with `is_correct` boolean indicator.
12. `quiz_attempts`: Student test sittings with `started_at`, `submitted_at`, calculated score, and 1-attempt constraint.
13. `answers`: Selected option choice per question in a quiz attempt.
14. `attendance`: Daily class presence logs with composite unique key `(course_id, student_id, date)` and status (`present`, `absent`).
15. `announcements`: Global campus bulletins and course-specific announcements.
16. `notifications`: Real-time user alert records with read/unread tracking.

---

## 📈 DBMS Concepts & Complex Analytical SQL Queries

This application illustrates core relational database principles implemented in `backend/app/services/report_service.py` and `database/useful_queries.sql`:

1. **Composite Relational GPA & Student Performance Query:**
   Uses `INNER JOIN`, `LEFT JOIN`, `AVG()`, `COUNT()`, and conditional aggregation to compute composite marks across assignments, quizzes, and attendance.
2. **Attendance Compliance & Shortage (< 75%) Query:**
   Computes session presence ratio using `GROUP BY Course.id, Student.id` with `HAVING percentage < 75.0` to filter exam-ineligible candidates.
3. **Course Enrollment & Seat Capacity Query:**
   Aggregates enrollment counts per subject grouped by department and faculty member with status partitioning (`active`, `dropped`, `completed`).
4. **Assignment Analytics Query:**
   Uses `COUNT()`, `AVG()`, `MIN()`, `MAX()`, and subqueries against total eligible enrolled students to compute completion rates and grade distributions.
5. **ACID Transaction Isolation:**
   - **Quiz Evaluation:** Atomically calculates student score across options inside `db.session.begin_nested()` / `db.session.commit()`.
   - **Grading Pipeline:** Validates score range ($0 \le \text{marks} \le \text{max\_marks}$), updates submission status, and atomically generates student grade notification.
   - **Batch Attendance Register:** Performs atomic multi-row upsert for entire class rosters in a single database transaction.

---

## 🚀 Local Installation & Setup Guide

### Prerequisites
- **Python 3.10+**
- **Node.js 18+ & npm**
- **MySQL 8.0+** (or SQLite fallback automatically handled if MySQL server is offline)

---

### Step 1: Clone or Open Project
Navigate to the root directory:
```bash
cd LMS
```

---

### Step 2: Database Setup (MySQL 8+)

1. Start your local MySQL server.
2. Create the database:
   ```sql
   CREATE DATABASE lms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. Import the schema and seed data:
   ```bash
   mysql -u root -p lms_db < database/schema.sql
   mysql -u root -p lms_db < database/seed.sql
   ```

*(Alternatively, you can run the automatic Python seeder in Step 3!)*

---

### Step 3: Backend Setup (Python Flask)

1. Navigate to the `backend/` folder:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment variables in `backend/.env` (or copy `.env.example`):
   ```ini
   FLASK_ENV=development
   SECRET_KEY=eduverse_super_secret_jwt_key_2026
   JWT_SECRET_KEY=eduverse_jwt_signing_token_2026
   
   # MySQL Connection:
   DATABASE_URL=mysql+pymysql://root:password@localhost:3306/lms_db
   ```
5. Seed the database with demo records:
   ```bash
   python seed_db.py
   ```
6. Start the Flask backend server:
   ```bash
   python run.py
   ```
   *Backend will run at: `http://127.0.0.1:5000`*

---

### Step 4: Frontend Setup (React + Vite)

1. Open a new terminal and navigate to the `frontend/` folder:
   ```bash
   cd frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *Frontend will run at: `http://localhost:5173`*

---

## 🌐 API Endpoints Summary

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register student account
- `POST /api/auth/login` — Sign in and receive JWT token + user profile
- `GET  /api/auth/me` — Current authenticated user profile
- `PUT  /api/auth/profile` — Update user profile & avatar
- `PUT  /api/auth/change-password` — Secure password update

### Courses & Materials (`/api/courses`)
- `GET  /api/courses` — List all courses (supports `?search=`, `?department=`, `?my_courses=true`)
- `POST /api/courses` — Create new course *(Faculty/Admin)*
- `GET  /api/courses/:id` — Course detail with syllabus, materials, assignments, quizzes
- `PUT  /api/courses/:id` — Update course curriculum *(Faculty/Admin)*
- `DELETE /api/courses/:id` — Delete course *(Faculty/Admin)*
- `POST /api/courses/:id/materials` — Upload file or link lecture notes *(Faculty/Admin)*

### Enrollments (`/api/enrollments`)
- `GET  /api/enrollments` — List all enrollment records *(Admin)*
- `POST /api/enrollments` — Enroll in a course *(Student)*
- `DELETE /api/enrollments/:id` — Drop student enrollment *(Student/Admin)*

### Assignments & Submissions (`/api/assignments`, `/api/submissions`)
- `GET  /api/assignments` — List course assignments
- `POST /api/assignments` — Create assignment *(Faculty/Admin)*
- `POST /api/submissions` — Upload and submit student solution *(Student)*
- `GET  /api/assignments/:id/submissions` — View class submissions queue *(Faculty/Admin)*
- `POST /api/submissions/:id/grade` — Grade submission with marks & feedback *(Faculty/Admin)*

### Quizzes & Assessments (`/api/quizzes`)
- `GET  /api/quizzes` — List active quizzes
- `POST /api/quizzes` — Create timed multiple-choice quiz with question bank *(Faculty/Admin)*
- `GET  /api/quizzes/:id` — Get quiz questions and duration
- `POST /api/quizzes/:id/submit` — Atomic submit and automated scoring *(Student)*
- `GET  /api/quizzes/:id/results` — Student score roster *(Faculty/Admin)*

### Attendance (`/api/attendance`)
- `GET  /api/attendance/overview` — Course-wise student attendance records & 75% shortage alert
- `GET  /api/attendance/course/:id` — Course session roster sheet *(Faculty/Admin)*
- `POST /api/attendance/mark` — Batch mark class attendance *(Faculty/Admin)*

### Analytical Reports (`/api/reports`)
- `GET  /api/reports/enrollments` — Course enrollment capacity & status report
- `GET  /api/reports/performance` — Composite student GPA matrix
- `GET  /api/reports/attendance` — Attendance compliance & shortage report (< 75%)
- `GET  /api/reports/submissions` — Assignment submission rates & grade distribution

---

## 🧪 Automated Testing

Run the automated integration test suite covering all 3 portals and DBMS queries:
```bash
cd backend
python test_e2e.py
```
*Expected output: `ALL 14 INTEGRATION TESTS PASSED WITH 100% SUCCESS!`*

---

## 📄 License
This project is built for educational and university DBMS capstone requirements. Open-source under the MIT License.
