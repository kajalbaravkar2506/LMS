import os
import sys
from datetime import datetime, date, timedelta
from decimal import Decimal

# Ensure app can be imported
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app import create_app
from app.models import (
    db, User, Student, Faculty, Course, CourseMaterial, Enrollment,
    Assignment, Submission, Quiz, Question, Option, QuizAttempt, Answer,
    Attendance, Announcement, Notification
)

app = create_app('development')

def seed_database():
    with app.app_context():
        print("[*] Creating database tables...")
        db.create_all()

        print("[*] Cleaning existing data...")
        Answer.query.delete()
        QuizAttempt.query.delete()
        Option.query.delete()
        Question.query.delete()
        Quiz.query.delete()
        Submission.query.delete()
        Assignment.query.delete()
        CourseMaterial.query.delete()
        Attendance.query.delete()
        Announcement.query.delete()
        Notification.query.delete()
        Enrollment.query.delete()
        Course.query.delete()
        Faculty.query.delete()
        Student.query.delete()
        User.query.delete()
        db.session.commit()

        print("[*] Seeding Users & Profiles...")
        # 1. Admin
        admin = User(
            full_name="Dr. Sarah Jenkins",
            email="admin@lms.edu",
            role="admin",
            phone="+1-555-0100",
            profile_image="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
            is_active=True
        )
        admin.set_password("Password123!")
        db.session.add(admin)
        db.session.flush()

        # 2. Faculty
        fac1_user = User(
            full_name="Dr. Alan Turing",
            email="dr.alan@lms.edu",
            role="faculty",
            phone="+1-555-0101",
            profile_image="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
            is_active=True
        )
        fac1_user.set_password("Password123!")
        db.session.add(fac1_user)
        db.session.flush()

        fac1 = Faculty(
            user_id=fac1_user.id,
            faculty_number="FAC001",
            department="Computer Science",
            designation="Professor & Department Chair"
        )
        db.session.add(fac1)

        fac2_user = User(
            full_name="Dr. Grace Hopper",
            email="dr.grace@lms.edu",
            role="faculty",
            phone="+1-555-0102",
            profile_image="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150",
            is_active=True
        )
        fac2_user.set_password("Password123!")
        db.session.add(fac2_user)
        db.session.flush()

        fac2 = Faculty(
            user_id=fac2_user.id,
            faculty_number="FAC002",
            department="Computer Science",
            designation="Associate Professor"
        )
        db.session.add(fac2)

        fac3_user = User(
            full_name="Dr. Ada Lovelace",
            email="dr.ada@lms.edu",
            role="faculty",
            phone="+1-555-0103",
            profile_image="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
            is_active=True
        )
        fac3_user.set_password("Password123!")
        db.session.add(fac3_user)
        db.session.flush()

        fac3 = Faculty(
            user_id=fac3_user.id,
            faculty_number="FAC003",
            department="Computer Science",
            designation="Assistant Professor"
        )
        db.session.add(fac3)
        db.session.flush()

        # 3. Students
        students_info = [
            ("Alex Johnson", "student1@lms.edu", "+1-555-0201", "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150", "STU2024001", "Computer Science", 3, 5),
            ("Brian Miller", "student2@lms.edu", "+1-555-0202", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", "STU2024002", "Computer Science", 3, 5),
            ("Catherine Davis", "student3@lms.edu", "+1-555-0203", "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150", "STU2024003", "Computer Science", 3, 5),
            ("Daniel Wilson", "student4@lms.edu", "+1-555-0204", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150", "STU2024004", "Computer Science", 3, 5),
            ("Emily Brown", "student5@lms.edu", "+1-555-0205", "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150", "STU2024005", "Computer Science", 3, 5),
            ("Frank Thomas", "student6@lms.edu", "+1-555-0206", "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150", "STU2024006", "Information Technology", 2, 3),
            ("Grace Martinez", "student7@lms.edu", "+1-555-0207", "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150", "STU2024007", "Information Technology", 2, 3),
            ("Henry Clark", "student8@lms.edu", "+1-555-0208", "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150", "STU2024008", "Computer Science", 4, 7),
            ("Isabella Rodriguez", "student9@lms.edu", "+1-555-0209", "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150", "STU2024009", "Computer Science", 4, 7),
            ("Jack White", "student10@lms.edu", "+1-555-0210", "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150", "STU2024010", "Computer Science", 3, 5),
        ]

        student_objects = []
        for name, email, phone, img, sno, dept, yr, sem in students_info:
            u = User(
                full_name=name,
                email=email,
                role="student",
                phone=phone,
                profile_image=img,
                is_active=True
            )
            u.set_password("Password123!")
            db.session.add(u)
            db.session.flush()

            st = Student(
                user_id=u.id,
                student_number=sno,
                department=dept,
                year=yr,
                semester=sem
            )
            db.session.add(st)
            db.session.flush()
            student_objects.append(st)

        print("[*] Seeding Courses...")
        c1 = Course(
            course_code="CS301",
            course_name="Database Management Systems",
            description="Comprehensive study of relational database design, SQL querying, normalization, transaction management, indexing, and concurrency control.",
            syllabus="Unit 1: ER Modeling & Relational Algebra\nUnit 2: SQL & Advanced Query Optimization\nUnit 3: Normal Forms (1NF, 2NF, 3NF, BCNF)\nUnit 4: ACID Transactions & Concurrency Control\nUnit 5: Storage, Indexing & Query Processing",
            credits=4,
            semester=5,
            department="Computer Science",
            faculty_id=fac1.id
        )
        c2 = Course(
            course_code="CS302",
            course_name="Operating Systems",
            description="Fundamental concepts of operating system architecture, process scheduling, memory virtualization, synchronization, deadlock, and file systems.",
            syllabus="Unit 1: Processes and Threads\nUnit 2: CPU Scheduling Algorithms\nUnit 3: Synchronization & Semaphores\nUnit 4: Deadlocks & Prevention\nUnit 5: Virtual Memory & Page Replacement",
            credits=4,
            semester=5,
            department="Computer Science",
            faculty_id=fac2.id
        )
        c3 = Course(
            course_code="CS303",
            course_name="Computer Networks",
            description="Explores network protocols, OSI and TCP/IP stack layers, routing algorithms, socket programming, flow control, and cybersecurity fundamentals.",
            syllabus="Unit 1: Physical & Data Link Layer\nUnit 2: Network Layer & Routing Protocols\nUnit 3: Transport Layer (TCP/UDP)\nUnit 4: Application Layer (HTTP, DNS)\nUnit 5: Network Security & Cryptography",
            credits=3,
            semester=5,
            department="Computer Science",
            faculty_id=fac3.id
        )
        c4 = Course(
            course_code="AI401",
            course_name="Artificial Intelligence",
            description="Explores foundational AI concepts including state space search algorithms, game theory, knowledge representation, reasoning, and machine learning principles.",
            syllabus="Unit 1: Uninformed & Heuristic Search (A*)\nUnit 2: Adversarial Search & Minimax\nUnit 3: Knowledge Representation & First-Order Logic\nUnit 4: Probabilistic Reasoning & Bayes Nets\nUnit 5: Intro to Machine Learning & Neural Nets",
            credits=4,
            semester=7,
            department="Computer Science",
            faculty_id=fac1.id
        )
        db.session.add_all([c1, c2, c3, c4])
        db.session.flush()

        print("[*] Seeding Enrollments...")
        # Enroll students in courses
        for st in student_objects[:7]:
            db.session.add(Enrollment(student_id=st.id, course_id=c1.id, enrollment_date=date(2026, 8, 1), status='active'))
        for st in student_objects[:5]:
            db.session.add(Enrollment(student_id=st.id, course_id=c2.id, enrollment_date=date(2026, 8, 1), status='active'))
        for st in [student_objects[0], student_objects[1], student_objects[5], student_objects[6]]:
            db.session.add(Enrollment(student_id=st.id, course_id=c3.id, enrollment_date=date(2026, 8, 1), status='active'))
        for st in [student_objects[7], student_objects[8], student_objects[0]]:
            db.session.add(Enrollment(student_id=st.id, course_id=c4.id, enrollment_date=date(2026, 8, 1), status='active'))
        db.session.flush()

        print("[*] Seeding Course Materials...")
        materials = [
            CourseMaterial(course_id=c1.id, title="Lecture 01 - Relational Model & SQL Fundamentals", description="Relational algebra, keys, and SQL schema creation.", file_url="/uploads/materials/dbms_lecture_01.pdf", material_type="pdf", uploaded_by=fac1_user.id),
            CourseMaterial(course_id=c1.id, title="Lecture 02 - Normalization Guide (1NF to BCNF)", description="Functional dependencies, Armstrong axioms, and lossless join decomposition.", file_url="/uploads/materials/dbms_normalization_guide.pdf", material_type="pdf", uploaded_by=fac1_user.id),
            CourseMaterial(course_id=c1.id, title="Sample Database Schema & Seed Script", description="Full SQL scripts for the university bookstore database.", file_url="/uploads/materials/bookstore_schema.sql", material_type="code", uploaded_by=fac1_user.id),
            CourseMaterial(course_id=c2.id, title="Lecture 01 - OS Architecture & Kernel Space", description="Process control blocks, system calls, and interrupts.", file_url="/uploads/materials/os_lecture_01.pdf", material_type="pdf", uploaded_by=fac2_user.id),
            CourseMaterial(course_id=c3.id, title="Lecture 01 - TCP/IP Protocol Stack & Wireshark", description="Layered architecture, packet headers, and Wireshark trace analysis.", file_url="/uploads/materials/networks_lecture_01.pdf", material_type="pdf", uploaded_by=fac3_user.id),
            CourseMaterial(course_id=c4.id, title="Lecture 01 - Search Algorithms & Heuristics", description="State space graphs, A* search, and heuristic admissibility.", file_url="/uploads/materials/ai_search_algorithms.pdf", material_type="pdf", uploaded_by=fac1_user.id),
        ]
        db.session.add_all(materials)
        db.session.flush()

        print("[*] Seeding Assignments & Submissions...")
        now = datetime.utcnow()
        asgn1 = Assignment(course_id=c1.id, title="Assignment 1: Relational Schema Design & Normalization", description="Design a 3NF normalized relational schema for an e-commerce platform. Submit ER diagram, schema DDL, and sample queries.", due_date=now + timedelta(days=5), max_marks=Decimal('50.00'), created_by=fac1_user.id)
        asgn2 = Assignment(course_id=c1.id, title="Assignment 2: Complex SQL Queries & Aggregations", description="Write optimized SQL queries for 10 analytical business scenarios using JOINs, GROUP BY, HAVING, and subqueries.", due_date=now + timedelta(days=14), max_marks=Decimal('50.00'), created_by=fac1_user.id)
        asgn3 = Assignment(course_id=c2.id, title="Assignment 1: CPU Scheduling Simulator", description="Implement FCFS, SJF, and Round Robin scheduling algorithms in C++ or Python. Analyze turnaround and waiting time metrics.", due_date=now + timedelta(days=3), max_marks=Decimal('40.00'), created_by=fac2_user.id)
        asgn4 = Assignment(course_id=c3.id, title="Assignment 1: Socket Programming & Chat Server", description="Build a multi-client concurrent chat server utilizing TCP sockets and multithreading.", due_date=now + timedelta(days=8), max_marks=Decimal('40.00'), created_by=fac3_user.id)
        asgn5 = Assignment(course_id=c4.id, title="Assignment 1: A* Search for 8-Puzzle Problem", description="Implement A* search algorithm using Manhattan Distance and Misplaced Tiles heuristics to solve random 8-puzzle configurations.", due_date=now + timedelta(days=10), max_marks=Decimal('50.00'), created_by=fac1_user.id)
        db.session.add_all([asgn1, asgn2, asgn3, asgn4, asgn5])
        db.session.flush()

        sub1 = Submission(assignment_id=asgn1.id, student_id=student_objects[0].id, file_url="/uploads/submissions/stu1_asgn1_dbms.pdf", submitted_at=now - timedelta(days=2), marks=Decimal('48.00'), feedback="Excellent ER diagram and clean 3NF decomposition with well-defined constraints.", status="graded", graded_at=now - timedelta(days=1))
        sub2 = Submission(assignment_id=asgn1.id, student_id=student_objects[1].id, file_url="/uploads/submissions/stu2_asgn1_dbms.pdf", submitted_at=now - timedelta(days=1), marks=Decimal('44.00'), feedback="Good schema design. Minor redundancy in order item table.", status="graded", graded_at=now - timedelta(days=1))
        sub3 = Submission(assignment_id=asgn1.id, student_id=student_objects[2].id, file_url="/uploads/submissions/stu3_asgn1_dbms.pdf", submitted_at=now - timedelta(days=1), marks=Decimal('46.50'), feedback="Well-structured foreign keys and check constraints.", status="graded", graded_at=now - timedelta(days=1))
        sub4 = Submission(assignment_id=asgn1.id, student_id=student_objects[3].id, file_url="/uploads/submissions/stu4_asgn1_dbms.pdf", submitted_at=now, marks=None, feedback=None, status="submitted", graded_at=None)
        sub5 = Submission(assignment_id=asgn1.id, student_id=student_objects[4].id, file_url="/uploads/submissions/stu5_asgn1_dbms.pdf", submitted_at=now, marks=None, feedback=None, status="submitted", graded_at=None)
        sub6 = Submission(assignment_id=asgn3.id, student_id=student_objects[0].id, file_url="/uploads/submissions/stu1_asgn3_os.zip", submitted_at=now - timedelta(days=1), marks=Decimal('38.00'), feedback="Great implementation of Round Robin with clean timing metrics.", status="graded", graded_at=now)
        db.session.add_all([sub1, sub2, sub3, sub4, sub5, sub6])
        db.session.flush()

        print("[*] Seeding Quizzes, Questions & Options...")
        q1 = Quiz(course_id=c1.id, title="Quiz 1: SQL Fundamentals & Normalization", description="Multiple choice quiz testing knowledge of keys, joins, aggregate functions, and 1NF through BCNF rules.", duration_minutes=20, max_marks=Decimal('10.00'), created_by=fac1_user.id)
        q2 = Quiz(course_id=c2.id, title="Quiz 1: Process Management & CPU Scheduling", description="Assessment on process lifecycle, context switching, scheduling algorithms, and deadlock conditions.", duration_minutes=25, max_marks=Decimal('10.00'), created_by=fac2_user.id)
        q3 = Quiz(course_id=c3.id, title="Quiz 1: OSI Stack & TCP/IP Layering", description="Quick review quiz covering packet encapsulation, subnetting, and socket endpoints.", duration_minutes=15, max_marks=Decimal('10.00'), created_by=fac3_user.id)
        q4 = Quiz(course_id=c4.id, title="Quiz 1: Heuristic Search & Logic", description="Heuristic admissibility, search space tree traversal, and propositional logic.", duration_minutes=20, max_marks=Decimal('10.00'), created_by=fac1_user.id)
        db.session.add_all([q1, q2, q3, q4])
        db.session.flush()

        # Quiz 1 Questions
        qq1 = Question(quiz_id=q1.id, question_text="Which normal form eliminates partial functional dependency on the primary key?", marks=Decimal('2.00'))
        qq2 = Question(quiz_id=q1.id, question_text="What is the default isolation level in MySQL InnoDB storage engine?", marks=Decimal('2.00'))
        qq3 = Question(quiz_id=q1.id, question_text="Which SQL clause is used to filter records after aggregate functions have been applied?", marks=Decimal('2.00'))
        qq4 = Question(quiz_id=q1.id, question_text="What kind of JOIN returns all records from the left table and matched records from the right table?", marks=Decimal('2.00'))
        qq5 = Question(quiz_id=q1.id, question_text="Which property of ACID ensures that transactions are committed permanently even in case of system crash?", marks=Decimal('2.00'))
        db.session.add_all([qq1, qq2, qq3, qq4, qq5])
        db.session.flush()

        opt1 = [
            Option(question_id=qq1.id, option_text="First Normal Form (1NF)", is_correct=False),
            Option(question_id=qq1.id, option_text="Second Normal Form (2NF)", is_correct=True),
            Option(question_id=qq1.id, option_text="Third Normal Form (3NF)", is_correct=False),
            Option(question_id=qq1.id, option_text="Boyce-Codd Normal Form (BCNF)", is_correct=False),

            Option(question_id=qq2.id, option_text="READ UNCOMMITTED", is_correct=False),
            Option(question_id=qq2.id, option_text="READ COMMITTED", is_correct=False),
            Option(question_id=qq2.id, option_text="REPEATABLE READ", is_correct=True),
            Option(question_id=qq2.id, option_text="SERIALIZABLE", is_correct=False),

            Option(question_id=qq3.id, option_text="WHERE", is_correct=False),
            Option(question_id=qq3.id, option_text="GROUP BY", is_correct=False),
            Option(question_id=qq3.id, option_text="HAVING", is_correct=True),
            Option(question_id=qq3.id, option_text="ORDER BY", is_correct=False),

            Option(question_id=qq4.id, option_text="INNER JOIN", is_correct=False),
            Option(question_id=qq4.id, option_text="LEFT OUTER JOIN", is_correct=True),
            Option(question_id=qq4.id, option_text="RIGHT OUTER JOIN", is_correct=False),
            Option(question_id=qq4.id, option_text="FULL JOIN", is_correct=False),

            Option(question_id=qq5.id, option_text="Atomicity", is_correct=False),
            Option(question_id=qq5.id, option_text="Consistency", is_correct=False),
            Option(question_id=qq5.id, option_text="Isolation", is_correct=False),
            Option(question_id=qq5.id, option_text="Durability", is_correct=True),
        ]
        db.session.add_all(opt1)
        db.session.flush()

        # Quiz 2 Questions
        qq6 = Question(quiz_id=q2.id, question_text="Which CPU scheduling algorithm is subject to the Convoy Effect?", marks=Decimal('2.50'))
        qq7 = Question(quiz_id=q2.id, question_text="Which of the following is NOT one of Coffman four deadlock conditions?", marks=Decimal('2.50'))
        qq8 = Question(quiz_id=q2.id, question_text="What data structure maintains the state of an active process in the operating system kernel?", marks=Decimal('2.50'))
        qq9 = Question(quiz_id=q2.id, question_text="What type of page replacement algorithm suffers from Belady Anomaly?", marks=Decimal('2.50'))
        db.session.add_all([qq6, qq7, qq8, qq9])
        db.session.flush()

        opt2 = [
            Option(question_id=qq6.id, option_text="First-Come, First-Served (FCFS)", is_correct=True),
            Option(question_id=qq6.id, option_text="Round Robin (RR)", is_correct=False),
            Option(question_id=qq6.id, option_text="Shortest Job First (SJF)", is_correct=False),
            Option(question_id=qq6.id, option_text="Priority Scheduling", is_correct=False),

            Option(question_id=qq7.id, option_text="Mutual Exclusion", is_correct=False),
            Option(question_id=qq7.id, option_text="Hold and Wait", is_correct=False),
            Option(question_id=qq7.id, option_text="Preemption Allowed", is_correct=True),
            Option(question_id=qq7.id, option_text="Circular Wait", is_correct=False),

            Option(question_id=qq8.id, option_text="Process Control Block (PCB)", is_correct=True),
            Option(question_id=qq8.id, option_text="Thread Local Storage (TLS)", is_correct=False),
            Option(question_id=qq8.id, option_text="File Descriptor Table", is_correct=False),
            Option(question_id=qq8.id, option_text="Virtual Memory Map", is_correct=False),

            Option(question_id=qq9.id, option_text="Least Recently Used (LRU)", is_correct=False),
            Option(question_id=qq9.id, option_text="First-In, First-Out (FIFO)", is_correct=True),
            Option(question_id=qq9.id, option_text="Optimal Page Replacement", is_correct=False),
            Option(question_id=qq9.id, option_text="Clock Algorithm", is_correct=False),
        ]
        db.session.add_all(opt2)
        db.session.flush()

        # Quiz attempts
        qa1 = QuizAttempt(quiz_id=q1.id, student_id=student_objects[0].id, started_at=now - timedelta(days=3), submitted_at=now - timedelta(days=3) + timedelta(minutes=12), score=Decimal('10.00'))
        qa2 = QuizAttempt(quiz_id=q1.id, student_id=student_objects[1].id, started_at=now - timedelta(days=3), submitted_at=now - timedelta(days=3) + timedelta(minutes=16), score=Decimal('8.00'))
        qa3 = QuizAttempt(quiz_id=q1.id, student_id=student_objects[2].id, started_at=now - timedelta(days=2), submitted_at=now - timedelta(days=2) + timedelta(minutes=14), score=Decimal('8.00'))
        qa4 = QuizAttempt(quiz_id=q1.id, student_id=student_objects[3].id, started_at=now - timedelta(days=2), submitted_at=now - timedelta(days=2) + timedelta(minutes=18), score=Decimal('6.00'))
        qa5 = QuizAttempt(quiz_id=q2.id, student_id=student_objects[0].id, started_at=now - timedelta(days=1), submitted_at=now - timedelta(days=1) + timedelta(minutes=20), score=Decimal('10.00'))
        db.session.add_all([qa1, qa2, qa3, qa4, qa5])
        db.session.flush()

        # Answers for qa1 (5/5 correct)
        db.session.add_all([
            Answer(attempt_id=qa1.id, question_id=qq1.id, selected_option_id=opt1[1].id),
            Answer(attempt_id=qa1.id, question_id=qq2.id, selected_option_id=opt1[6].id),
            Answer(attempt_id=qa1.id, question_id=qq3.id, selected_option_id=opt1[10].id),
            Answer(attempt_id=qa1.id, question_id=qq4.id, selected_option_id=opt1[13].id),
            Answer(attempt_id=qa1.id, question_id=qq5.id, selected_option_id=opt1[19].id),
        ])

        print("[*] Seeding Attendance Records...")
        dates = [date(2026, 8, 10), date(2026, 8, 12), date(2026, 8, 15), date(2026, 8, 17)]
        for d in dates:
            for i, st in enumerate(student_objects[:7]):
                # Make student 6 have low attendance
                status = 'absent' if (st.id == student_objects[5].id and d != dates[3]) else 'present'
                db.session.add(Attendance(course_id=c1.id, student_id=st.id, date=d, status=status, marked_by=fac1_user.id))

        os_dates = [date(2026, 8, 11), date(2026, 8, 14)]
        for d in os_dates:
            for st in student_objects[:5]:
                db.session.add(Attendance(course_id=c2.id, student_id=st.id, date=d, status='present', marked_by=fac2_user.id))
        db.session.flush()

        print("[*] Seeding Announcements & Notifications...")
        announcements = [
            Announcement(course_id=None, title="Welcome to Fall 2026 Semester!", content="Welcome back students and faculty! Please ensure you have completed course enrollments before the add/drop deadline this Friday.", created_by=admin.id),
            Announcement(course_id=None, title="Campus Central Library Extended Hours", content="The campus central library will remain open 24/7 during mid-term examination week starting next Monday.", created_by=admin.id),
            Announcement(course_id=c1.id, title="Mid-term Exam Syllabus & Schedule for CS301", content="The mid-term examination for CS301 will cover Units 1-3 (ER modeling, SQL joins, and Normalization). Practice questions have been uploaded to Course Materials.", created_by=fac1_user.id),
            Announcement(course_id=c1.id, title="Guest Lecture: Scalable Distributed SQL Architectures", content="Join us this Thursday at 3 PM in Auditorium B for a guest lecture by lead distributed systems engineers.", created_by=fac1_user.id),
            Announcement(course_id=c2.id, title="Lab 2 Submission Deadline Extended", content="Due to high server load during testing, the CPU Scheduling Simulator deadline has been extended by 48 hours.", created_by=fac2_user.id),
            Announcement(course_id=c3.id, title="Packet Tracer Network Topology Available", content="Please download the starter packet capture topologies for Assignment 1 from the Course Materials repository.", created_by=fac3_user.id),
        ]
        db.session.add_all(announcements)

        notifications = [
            Notification(user_id=student_objects[0].user_id, title="Assignment Graded", message="Your submission for 'Assignment 1: Relational Schema Design' in CS301 has been graded: 48/50.", type="grade", is_read=False),
            Notification(user_id=student_objects[0].user_id, title="Quiz Available", message="Quiz 1: SQL Fundamentals & Normalization is now open for submissions in CS301.", type="quiz", is_read=True),
            Notification(user_id=student_objects[0].user_id, title="New Material Uploaded", message="Dr. Alan Turing posted a new file: 'Sample Database SQL Scripts' in CS301.", type="material", is_read=False),
            Notification(user_id=student_objects[0].user_id, title="Upcoming Assignment Due", message="Assignment 1: CPU Scheduling Simulator is due in 3 days in CS302.", type="assignment", is_read=False),
            Notification(user_id=fac1_user.id, title="New Assignment Submission", message="Alex Johnson submitted Assignment 1 in CS301.", type="submission", is_read=True),
            Notification(user_id=fac1_user.id, title="Quiz Attempt Completed", message="Daniel Wilson completed Quiz 1 in CS301 with score 6/10.", type="quiz", is_read=False),
            Notification(user_id=admin.id, title="System Health Normal", message="All 16 tables populated and system transaction engine running nominal.", type="system", is_read=False),
        ]
        db.session.add_all(notifications)

        db.session.commit()
        print("[+] Database successfully initialized and seeded with demo data!")
        print("\n[i] Demo Credentials:")
        print("    Admin:    admin@lms.edu / Password123!")
        print("    Faculty:  dr.alan@lms.edu / Password123!")
        print("    Student:  student1@lms.edu / Password123!")

if __name__ == '__main__':
    seed_database()
