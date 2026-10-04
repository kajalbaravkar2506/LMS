-- =============================================================================
-- COLLEGE LEARNING MANAGEMENT SYSTEM (LMS) - SEED DATA
-- Database: lms_database
-- Demo Passwords for all accounts: Password123!
-- =============================================================================

USE `lms_database`;

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE `notifications`;
TRUNCATE TABLE `announcements`;
TRUNCATE TABLE `attendance`;
TRUNCATE TABLE `answers`;
TRUNCATE TABLE `quiz_attempts`;
TRUNCATE TABLE `options`;
TRUNCATE TABLE `questions`;
TRUNCATE TABLE `quizzes`;
TRUNCATE TABLE `submissions`;
TRUNCATE TABLE `assignments`;
TRUNCATE TABLE `course_materials`;
TRUNCATE TABLE `enrollments`;
TRUNCATE TABLE `courses`;
TRUNCATE TABLE `faculty`;
TRUNCATE TABLE `students`;
TRUNCATE TABLE `users`;

-- -----------------------------------------------------------------------------
-- 1. USERS (1 Admin, 3 Faculty, 10 Students)
-- Password for all: Password123! ($2b$12$.rUJFbyH4zf94xAJcL.hEe/xDqtokIQn4x2keDf3JPGLoKXCuT4.e)
-- -----------------------------------------------------------------------------
INSERT INTO `users` (`id`, `full_name`, `email`, `password_hash`, `role`, `phone`, `profile_image`, `is_active`) VALUES
(1, 'Dr. Sarah Jenkins', 'admin@lms.edu', '$2b$12$.rUJFbyH4zf94xAJcL.hEe/xDqtokIQn4x2keDf3JPGLoKXCuT4.e', 'admin', '+1-555-0100', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', 1),
(2, 'Dr. Alan Turing', 'dr.alan@lms.edu', '$2b$12$.rUJFbyH4zf94xAJcL.hEe/xDqtokIQn4x2keDf3JPGLoKXCuT4.e', 'faculty', '+1-555-0101', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 1),
(3, 'Dr. Grace Hopper', 'dr.grace@lms.edu', '$2b$12$.rUJFbyH4zf94xAJcL.hEe/xDqtokIQn4x2keDf3JPGLoKXCuT4.e', 'faculty', '+1-555-0102', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', 1),
(4, 'Dr. Ada Lovelace', 'dr.ada@lms.edu', '$2b$12$.rUJFbyH4zf94xAJcL.hEe/xDqtokIQn4x2keDf3JPGLoKXCuT4.e', 'faculty', '+1-555-0103', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', 1),
(5, 'Alex Johnson', 'student1@lms.edu', '$2b$12$.rUJFbyH4zf94xAJcL.hEe/xDqtokIQn4x2keDf3JPGLoKXCuT4.e', 'student', '+1-555-0201', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150', 1),
(6, 'Brian Miller', 'student2@lms.edu', '$2b$12$.rUJFbyH4zf94xAJcL.hEe/xDqtokIQn4x2keDf3JPGLoKXCuT4.e', 'student', '+1-555-0202', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 1),
(7, 'Catherine Davis', 'student3@lms.edu', '$2b$12$.rUJFbyH4zf94xAJcL.hEe/xDqtokIQn4x2keDf3JPGLoKXCuT4.e', 'student', '+1-555-0203', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 1),
(8, 'Daniel Wilson', 'student4@lms.edu', '$2b$12$.rUJFbyH4zf94xAJcL.hEe/xDqtokIQn4x2keDf3JPGLoKXCuT4.e', 'student', '+1-555-0204', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 1),
(9, 'Emily Brown', 'student5@lms.edu', '$2b$12$.rUJFbyH4zf94xAJcL.hEe/xDqtokIQn4x2keDf3JPGLoKXCuT4.e', 'student', '+1-555-0205', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', 1),
(10, 'Frank Thomas', 'student6@lms.edu', '$2b$12$.rUJFbyH4zf94xAJcL.hEe/xDqtokIQn4x2keDf3JPGLoKXCuT4.e', 'student', '+1-555-0206', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', 1),
(11, 'Grace Martinez', 'student7@lms.edu', '$2b$12$.rUJFbyH4zf94xAJcL.hEe/xDqtokIQn4x2keDf3JPGLoKXCuT4.e', 'student', '+1-555-0207', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', 1),
(12, 'Henry Clark', 'student8@lms.edu', '$2b$12$.rUJFbyH4zf94xAJcL.hEe/xDqtokIQn4x2keDf3JPGLoKXCuT4.e', 'student', '+1-555-0208', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', 1),
(13, 'Isabella Rodriguez', 'student9@lms.edu', '$2b$12$.rUJFbyH4zf94xAJcL.hEe/xDqtokIQn4x2keDf3JPGLoKXCuT4.e', 'student', '+1-555-0209', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150', 1),
(14, 'Jack White', 'student10@lms.edu', '$2b$12$.rUJFbyH4zf94xAJcL.hEe/xDqtokIQn4x2keDf3JPGLoKXCuT4.e', 'student', '+1-555-0210', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', 1);

-- -----------------------------------------------------------------------------
-- 2. FACULTY
-- -----------------------------------------------------------------------------
INSERT INTO `faculty` (`id`, `user_id`, `faculty_number`, `department`, `designation`) VALUES
(1, 2, 'FAC001', 'Computer Science', 'Professor & Department Chair'),
(2, 3, 'FAC002', 'Computer Science', 'Associate Professor'),
(3, 4, 'FAC003', 'Computer Science', 'Assistant Professor');

-- -----------------------------------------------------------------------------
-- 3. STUDENTS
-- -----------------------------------------------------------------------------
INSERT INTO `students` (`id`, `user_id`, `student_number`, `department`, `year`, `semester`) VALUES
(1, 5, 'STU2024001', 'Computer Science', 3, 5),
(2, 6, 'STU2024002', 'Computer Science', 3, 5),
(3, 7, 'STU2024003', 'Computer Science', 3, 5),
(4, 8, 'STU2024004', 'Computer Science', 3, 5),
(5, 9, 'STU2024005', 'Computer Science', 3, 5),
(6, 10, 'STU2024006', 'Information Technology', 2, 3),
(7, 11, 'STU2024007', 'Information Technology', 2, 3),
(8, 12, 'STU2024008', 'Computer Science', 4, 7),
(9, 13, 'STU2024009', 'Computer Science', 4, 7),
(10, 14, 'STU2024010', 'Computer Science', 3, 5);

-- -----------------------------------------------------------------------------
-- 4. COURSES
-- -----------------------------------------------------------------------------
INSERT INTO `courses` (`id`, `course_code`, `course_name`, `description`, `syllabus`, `credits`, `semester`, `department`, `faculty_id`) VALUES
(1, 'CS301', 'Database Management Systems', 'Comprehensive study of relational database design, SQL querying, normalization, transaction management, indexing, and concurrency control.', 'Unit 1: ER Modeling & Relational Algebra\nUnit 2: SQL & Advanced Query Optimization\nUnit 3: Normal Forms (1NF, 2NF, 3NF, BCNF)\nUnit 4: ACID Transactions & Concurrency Control\nUnit 5: Storage, Indexing & Query Processing', 4, 5, 'Computer Science', 1),
(2, 'CS302', 'Operating Systems', 'Fundamental concepts of operating system architecture, process scheduling, memory virtualization, synchronization, deadlock, and file systems.', 'Unit 1: Processes and Threads\nUnit 2: CPU Scheduling Algorithms\nUnit 3: Synchronization & Semaphores\nUnit 4: Deadlocks & Prevention\nUnit 5: Virtual Memory & Page Replacement', 4, 5, 'Computer Science', 2),
(3, 'CS303', 'Computer Networks', 'Explores network protocols, OSI and TCP/IP stack layers, routing algorithms, socket programming, flow control, and cybersecurity fundamentals.', 'Unit 1: Physical & Data Link Layer\nUnit 2: Network Layer & Routing Protocols\nUnit 3: Transport Layer (TCP/UDP)\nUnit 4: Application Layer (HTTP, DNS)\nUnit 5: Network Security & Cryptography', 3, 5, 'Computer Science', 3),
(4, 'AI401', 'Artificial Intelligence', 'Explores foundational AI concepts including state space search algorithms, game theory, knowledge representation, reasoning, and machine learning principles.', 'Unit 1: Uninformed & Heuristic Search (A*)\nUnit 2: Adversarial Search & Minimax\nUnit 3: Knowledge Representation & First-Order Logic\nUnit 4: Probabilistic Reasoning & Bayes Nets\nUnit 5: Intro to Machine Learning & Neural Nets', 4, 7, 'Computer Science', 1);

-- -----------------------------------------------------------------------------
-- 5. ENROLLMENTS
-- -----------------------------------------------------------------------------
INSERT INTO `enrollments` (`id`, `student_id`, `course_id`, `enrollment_date`, `status`) VALUES
-- CS301 (DBMS)
(1, 1, 1, '2026-08-01', 'active'),
(2, 2, 1, '2026-08-01', 'active'),
(3, 3, 1, '2026-08-02', 'active'),
(4, 4, 1, '2026-08-02', 'active'),
(5, 5, 1, '2026-08-03', 'active'),
(6, 6, 1, '2026-08-03', 'active'),
(7, 10, 1, '2026-08-04', 'active'),
-- CS302 (OS)
(8, 1, 2, '2026-08-01', 'active'),
(9, 2, 2, '2026-08-01', 'active'),
(10, 3, 2, '2026-08-02', 'active'),
(11, 4, 2, '2026-08-02', 'active'),
(12, 5, 2, '2026-08-03', 'active'),
-- CS303 (Networks)
(13, 1, 3, '2026-08-01', 'active'),
(14, 2, 3, '2026-08-01', 'active'),
(15, 6, 3, '2026-08-02', 'active'),
(16, 7, 3, '2026-08-02', 'active'),
-- AI401 (AI)
(17, 8, 4, '2026-08-01', 'active'),
(18, 9, 4, '2026-08-01', 'active'),
(19, 1, 4, '2026-08-05', 'active');

-- -----------------------------------------------------------------------------
-- 6. COURSE MATERIALS
-- -----------------------------------------------------------------------------
INSERT INTO `course_materials` (`id`, `course_id`, `title`, `description`, `file_url`, `material_type`, `uploaded_by`) VALUES
(1, 1, 'Lecture 01 - Relational Model & SQL Fundamentals', 'Comprehensive slide deck covering relational algebra, keys, and basic SQL syntax.', '/uploads/materials/dbms_lecture_01.pdf', 'pdf', 2),
(2, 1, 'Lecture 02 - Normalization Guide (1NF to BCNF)', 'Detailed cheat sheet and practice problem decomposition with solutions.', '/uploads/materials/dbms_normalization_guide.pdf', 'pdf', 2),
(3, 1, 'Sample Database SQL Scripts', 'DDL and DML scripts for the university bookstore case study.', '/uploads/materials/bookstore_schema.sql', 'code', 2),
(4, 2, 'Lecture 01 - OS Architecture & Processes', 'Introduction to kernels, process control blocks (PCB), and context switching.', '/uploads/materials/os_lecture_01.pdf', 'pdf', 3),
(5, 2, 'Process Scheduling Simulator Handout', 'Lab guide for implementing Round Robin and Priority Scheduling in C/C++.', '/uploads/materials/os_scheduling_lab.pdf', 'pdf', 3),
(6, 3, 'Lecture 01 - TCP/IP Protocol Suite & Wireshark', 'Packet capturing walkthrough and TCP 3-way handshake analysis.', '/uploads/materials/networks_lecture_01.pdf', 'pdf', 4),
(7, 4, 'Lecture 01 - Search Algorithms & Heuristics', 'Detailed pseudocode and step-by-step trace of A* search and minimax tree pruning.', '/uploads/materials/ai_search_algorithms.pdf', 'pdf', 2);

-- -----------------------------------------------------------------------------
-- 7. ASSIGNMENTS
-- -----------------------------------------------------------------------------
INSERT INTO `assignments` (`id`, `course_id`, `title`, `description`, `due_date`, `max_marks`, `created_by`) VALUES
(1, 1, 'Assignment 1: Relational Schema Design & Normalization', 'Design an normalized 3NF schema for an e-commerce platform. Provide ER diagram, functional dependencies, and MySQL DDL script.', DATE_ADD(NOW(), INTERVAL 5 DAY), 50.00, 2),
(2, 1, 'Assignment 2: Complex SQL Queries & Aggregation', 'Write optimized SQL queries for 10 analytical business scenarios using JOINs, GROUP BY, HAVING, and subqueries.', DATE_ADD(NOW(), INTERVAL 14 DAY), 50.00, 2),
(3, 2, 'Assignment 1: CPU Scheduling Simulator', 'Implement FCFS, SJF, and Round Robin scheduling algorithms in C++ or Python. Analyze turnaround and waiting time metrics.', DATE_ADD(NOW(), INTERVAL 3 DAY), 40.00, 3),
(4, 3, 'Assignment 1: Socket Programming & Chat Server', 'Build a multi-client concurrent chat server utilizing TCP sockets and multithreading.', DATE_ADD(NOW(), INTERVAL 8 DAY), 40.00, 4),
(5, 4, 'Assignment 1: A* Search for 8-Puzzle Problem', 'Implement A* search algorithm using Manhattan Distance and Misplaced Tiles heuristics to solve random 8-puzzle configurations.', DATE_ADD(NOW(), INTERVAL 10 DAY), 50.00, 2);

-- -----------------------------------------------------------------------------
-- 8. SUBMISSIONS
-- -----------------------------------------------------------------------------
INSERT INTO `submissions` (`id`, `assignment_id`, `student_id`, `file_url`, `submitted_at`, `marks`, `feedback`, `status`, `graded_at`) VALUES
-- Submissions for Assignment 1 (DBMS)
(1, 1, 1, '/uploads/submissions/stu1_asgn1_dbms.pdf', DATE_SUB(NOW(), INTERVAL 2 DAY), 48.00, 'Excellent ER diagram and clean 3NF decomposition with well-defined constraints.', 'graded', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(2, 1, 2, '/uploads/submissions/stu2_asgn1_dbms.pdf', DATE_SUB(NOW(), INTERVAL 1 DAY), 44.00, 'Good schema design. Minor redundancy in order item table.', 'graded', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(3, 1, 3, '/uploads/submissions/stu3_asgn1_dbms.pdf', DATE_SUB(NOW(), INTERVAL 1 DAY), 46.50, 'Well-structured foreign keys and check constraints.', 'graded', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(4, 1, 4, '/uploads/submissions/stu4_asgn1_dbms.pdf', NOW(), NULL, NULL, 'submitted', NULL),
(5, 1, 5, '/uploads/submissions/stu5_asgn1_dbms.pdf', NOW(), NULL, NULL, 'submitted', NULL),
-- Submissions for Assignment 3 (OS)
(6, 3, 1, '/uploads/submissions/stu1_asgn3_os.zip', DATE_SUB(NOW(), INTERVAL 1 DAY), 38.00, 'Great implementation of Round Robin with clean timing metrics.', 'graded', NOW()),
(7, 3, 2, '/uploads/submissions/stu2_asgn3_os.zip', NOW(), NULL, NULL, 'submitted', NULL);

-- -----------------------------------------------------------------------------
-- 9. QUIZZES
-- -----------------------------------------------------------------------------
INSERT INTO `quizzes` (`id`, `course_id`, `title`, `description`, `duration_minutes`, `max_marks`, `created_by`) VALUES
(1, 1, 'Quiz 1: SQL Fundamentals & Normalization', 'Multiple choice quiz testing knowledge of keys, joins, aggregate functions, and 1NF through BCNF rules.', 20, 10.00, 2),
(2, 2, 'Quiz 1: Process Management & CPU Scheduling', 'Assessment on process lifecycle, context switching, scheduling algorithms, and deadlock conditions.', 25, 10.00, 3),
(3, 3, 'Quiz 1: OSI Stack & TCP/IP Layering', 'Quick review quiz covering packet encapsulation, subnetting, and socket endpoints.', 15, 10.00, 4),
(4, 4, 'Quiz 1: Heuristic Search & Logic', 'Heuristic admissibility, search space tree traversal, and propositional logic.', 20, 10.00, 2);

-- -----------------------------------------------------------------------------
-- 10. QUESTIONS & OPTIONS
-- -----------------------------------------------------------------------------
-- Questions for Quiz 1 (DBMS)
INSERT INTO `questions` (`id`, `quiz_id`, `question_text`, `marks`) VALUES
(1, 1, 'Which normal form eliminates partial functional dependency on the primary key?', 2.00),
(2, 1, 'What is the default isolation level in MySQL InnoDB storage engine?', 2.00),
(3, 1, 'Which SQL clause is used to filter records after aggregate functions have been applied?', 2.00),
(4, 1, 'What kind of JOIN returns all records from the left table and matched records from the right table?', 2.00),
(5, 1, 'Which property of ACID ensures that transactions are committed permanently even in case of system crash?', 2.00);

INSERT INTO `options` (`id`, `question_id`, `option_text`, `is_correct`) VALUES
(1, 1, 'First Normal Form (1NF)', 0),
(2, 1, 'Second Normal Form (2NF)', 1),
(3, 1, 'Third Normal Form (3NF)', 0),
(4, 1, 'Boyce-Codd Normal Form (BCNF)', 0),

(5, 2, 'READ UNCOMMITTED', 0),
(6, 2, 'READ COMMITTED', 0),
(7, 2, 'REPEATABLE READ', 1),
(8, 2, 'SERIALIZABLE', 0),

(9, 3, 'WHERE', 0),
(10, 3, 'GROUP BY', 0),
(11, 3, 'HAVING', 1),
(12, 3, 'ORDER BY', 0),

(13, 4, 'INNER JOIN', 0),
(14, 4, 'LEFT OUTER JOIN', 1),
(15, 4, 'RIGHT OUTER JOIN', 0),
(16, 4, 'FULL JOIN', 0),

(17, 5, 'Atomicity', 0),
(18, 5, 'Consistency', 0),
(19, 5, 'Isolation', 0),
(20, 5, 'Durability', 1);

-- Questions for Quiz 2 (OS)
INSERT INTO `questions` (`id`, `quiz_id`, `question_text`, `marks`) VALUES
(6, 2, 'Which CPU scheduling algorithm is subject to the Convoy Effect?', 2.50),
(7, 2, 'Which of the following is NOT one of Coffman four deadlock conditions?', 2.50),
(8, 2, 'What data structure maintains the state of an active process in the operating system kernel?', 2.50),
(9, 2, 'What type of page replacement algorithm suffers from Belady Anomaly?', 2.50);

INSERT INTO `options` (`id`, `question_id`, `option_text`, `is_correct`) VALUES
(21, 6, 'First-Come, First-Served (FCFS)', 1),
(22, 6, 'Round Robin (RR)', 0),
(23, 6, 'Shortest Job First (SJF)', 0),
(24, 6, 'Priority Scheduling', 0),

(25, 7, 'Mutual Exclusion', 0),
(26, 7, 'Hold and Wait', 0),
(27, 7, 'Preemption Allowed', 1),
(28, 7, 'Circular Wait', 0),

(29, 8, 'Process Control Block (PCB)', 1),
(30, 8, 'Thread Local Storage (TLS)', 0),
(31, 8, 'File Descriptor Table', 0),
(32, 8, 'Virtual Memory Map', 0),

(33, 9, 'Least Recently Used (LRU)', 0),
(34, 9, 'First-In, First-Out (FIFO)', 1),
(35, 9, 'Optimal Page Replacement', 0),
(36, 9, 'Clock Algorithm', 0);

-- -----------------------------------------------------------------------------
-- 11. QUIZ ATTEMPTS & ANSWERS
-- -----------------------------------------------------------------------------
INSERT INTO `quiz_attempts` (`id`, `quiz_id`, `student_id`, `started_at`, `submitted_at`, `score`) VALUES
(1, 1, 1, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY) + INTERVAL 12 MINUTE, 10.00),
(2, 1, 2, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY) + INTERVAL 16 MINUTE, 8.00),
(3, 1, 3, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 14 MINUTE, 8.00),
(4, 1, 4, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 18 MINUTE, 6.00),
(5, 2, 1, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 20 MINUTE, 10.00);

-- Answers for Attempt 1 (Alex Johnson - Quiz 1: 5/5 correct = 10.00)
INSERT INTO `answers` (`attempt_id`, `question_id`, `selected_option_id`) VALUES
(1, 1, 2),
(1, 2, 7),
(1, 3, 11),
(1, 4, 14),
(1, 5, 20);

-- Answers for Attempt 2 (Brian Miller - Quiz 1: 4/5 correct = 8.00)
INSERT INTO `answers` (`attempt_id`, `question_id`, `selected_option_id`) VALUES
(2, 1, 2),
(2, 2, 6), -- wrong
(2, 3, 11),
(2, 4, 14),
(2, 5, 20);

-- Answers for Attempt 3 (Catherine Davis - Quiz 1: 4/5 correct = 8.00)
INSERT INTO `answers` (`attempt_id`, `question_id`, `selected_option_id`) VALUES
(3, 1, 2),
(3, 2, 7),
(3, 3, 9), -- wrong
(3, 4, 14),
(3, 5, 20);

-- Answers for Attempt 4 (Daniel Wilson - Quiz 1: 3/5 correct = 6.00)
INSERT INTO `answers` (`attempt_id`, `question_id`, `selected_option_id`) VALUES
(4, 1, 1), -- wrong
(4, 2, 7),
(4, 3, 11),
(4, 4, 13), -- wrong
(4, 5, 20);

-- Answers for Attempt 5 (Alex Johnson - Quiz 2: 4/4 correct = 10.00)
INSERT INTO `answers` (`attempt_id`, `question_id`, `selected_option_id`) VALUES
(5, 6, 21),
(5, 7, 27),
(5, 8, 29),
(5, 9, 34);

-- -----------------------------------------------------------------------------
-- 12. ATTENDANCE
-- -----------------------------------------------------------------------------
INSERT INTO `attendance` (`course_id`, `student_id`, `date`, `status`, `marked_by`) VALUES
-- CS301 (DBMS) - Session 1 (2026-08-10)
(1, 1, '2026-08-10', 'present', 2),
(1, 2, '2026-08-10', 'present', 2),
(1, 3, '2026-08-10', 'present', 2),
(1, 4, '2026-08-10', 'present', 2),
(1, 5, '2026-08-10', 'present', 2),
(1, 6, '2026-08-10', 'absent', 2),
(1, 10, '2026-08-10', 'present', 2),
-- CS301 (DBMS) - Session 2 (2026-08-12)
(1, 1, '2026-08-12', 'present', 2),
(1, 2, '2026-08-12', 'present', 2),
(1, 3, '2026-08-12', 'present', 2),
(1, 4, '2026-08-12', 'absent', 2),
(1, 5, '2026-08-12', 'present', 2),
(1, 6, '2026-08-12', 'absent', 2),
(1, 10, '2026-08-12', 'present', 2),
-- CS301 (DBMS) - Session 3 (2026-08-15)
(1, 1, '2026-08-15', 'present', 2),
(1, 2, '2026-08-15', 'absent', 2),
(1, 3, '2026-08-15', 'present', 2),
(1, 4, '2026-08-15', 'present', 2),
(1, 5, '2026-08-15', 'present', 2),
(1, 6, '2026-08-15', 'absent', 2),
(1, 10, '2026-08-15', 'present', 2),
-- CS301 (DBMS) - Session 4 (2026-08-17)
(1, 1, '2026-08-17', 'present', 2),
(1, 2, '2026-08-17', 'present', 2),
(1, 3, '2026-08-17', 'present', 2),
(1, 4, '2026-08-17', 'present', 2),
(1, 5, '2026-08-17', 'absent', 2),
(1, 6, '2026-08-17', 'present', 2),
(1, 10, '2026-08-17', 'present', 2),
-- CS302 (OS) - Session 1 (2026-08-11)
(2, 1, '2026-08-11', 'present', 3),
(2, 2, '2026-08-11', 'present', 3),
(2, 3, '2026-08-11', 'present', 3),
(2, 4, '2026-08-11', 'present', 3),
(2, 5, '2026-08-11', 'present', 3),
-- CS302 (OS) - Session 2 (2026-08-14)
(2, 1, '2026-08-14', 'present', 3),
(2, 2, '2026-08-14', 'present', 3),
(2, 3, '2026-08-14', 'present', 3),
(2, 4, '2026-08-14', 'absent', 3),
(2, 5, '2026-08-14', 'present', 3);

-- -----------------------------------------------------------------------------
-- 13. ANNOUNCEMENTS
-- -----------------------------------------------------------------------------
INSERT INTO `announcements` (`id`, `course_id`, `title`, `content`, `created_by`) VALUES
(1, NULL, 'Welcome to Fall 2026 Semester!', 'Welcome back students and faculty! Please ensure you have completed course enrollments before the add/drop deadline this Friday.', 1),
(2, NULL, 'Campus Maintenance & Library Extended Hours', 'The campus central library will remain open 24/7 during mid-term examination week starting next Monday.', 1),
(3, 1, 'Mid-term Exam Syllabus & Schedule for CS301', 'The mid-term examination for CS301 will cover Units 1-3 (ER modeling, SQL joins, and Normalization). Practice questions have been uploaded to Course Materials.', 2),
(4, 1, 'Guest Lecture: Scalable Distributed SQL Architectures', 'Join us this Thursday at 3 PM in Auditorium B for a guest lecture by lead distributed systems engineers.', 2),
(5, 2, 'Lab 2 Submission Deadline Extended', 'Due to high server load during testing, the CPU Scheduling Simulator deadline has been extended by 48 hours.', 3),
(6, 3, 'Packet Tracer Network Topology Available', 'Please download the starter packet capture topologies for Assignment 1 from the Course Materials repository.', 4);

-- -----------------------------------------------------------------------------
-- 14. NOTIFICATIONS
-- -----------------------------------------------------------------------------
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`) VALUES
(1, 5, 'Assignment Graded', 'Your submission for "Assignment 1: Relational Schema Design" in CS301 has been graded: 48/50.', 'grade', 0),
(2, 5, 'Quiz Available', 'Quiz 1: SQL Fundamentals & Normalization is now open for submissions in CS301.', 'quiz', 1),
(3, 5, 'New Material Uploaded', 'Dr. Alan Turing posted a new file: "Sample Database SQL Scripts" in CS301.', 'material', 0),
(4, 5, 'Upcoming Assignment Due', 'Assignment 1: CPU Scheduling Simulator is due in 3 days in CS302.', 'assignment', 0),
(5, 2, 'New Assignment Submission', 'Alex Johnson submitted Assignment 1 in CS301.', 'submission', 1),
(6, 2, 'Quiz Attempt Completed', 'Daniel Wilson completed Quiz 1 in CS301 with score 6/10.', 'quiz', 0),
(7, 1, 'System Health Normal', 'All 16 tables populated and system transaction engine running nominal.', 'system', 0);

SET FOREIGN_KEY_CHECKS = 1;
