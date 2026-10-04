-- =============================================================================
-- COLLEGE LEARNING MANAGEMENT SYSTEM (LMS) - USEFUL DBMS QUERIES
-- Database: lms_database
-- Demonstrates: JOINs, Aggregates, GROUP BY, HAVING, Subqueries, Constraints,
-- Window Functions, and Transactional Scenarios.
-- =============================================================================

USE `lms_database`;

-- -----------------------------------------------------------------------------
-- 1. Display all students enrolled in a specific course (e.g., course_code = 'CS301')
-- Demonstrates: INNER JOIN across 3 tables (courses -> enrollments -> students -> users)
-- -----------------------------------------------------------------------------
SELECT 
    c.course_code,
    c.course_name,
    s.student_number,
    u.full_name AS student_name,
    u.email AS student_email,
    s.department,
    s.year,
    s.semester,
    e.enrollment_date,
    e.status AS enrollment_status
FROM courses c
INNER JOIN enrollments e ON c.id = e.course_id
INNER JOIN students s ON e.student_id = s.id
INNER JOIN users u ON s.user_id = u.id
WHERE c.course_code = 'CS301'
ORDER BY u.full_name ASC;


-- -----------------------------------------------------------------------------
-- 2. Display all courses taught by a specific faculty member (e.g., faculty_number = 'FAC001')
-- Demonstrates: JOIN between faculty, users, and courses with calculated student count
-- -----------------------------------------------------------------------------
SELECT 
    f.faculty_number,
    u.full_name AS faculty_name,
    f.designation,
    f.department,
    c.id AS course_id,
    c.course_code,
    c.course_name,
    c.credits,
    c.semester,
    COUNT(e.id) AS enrolled_students_count
FROM faculty f
INNER JOIN users u ON f.user_id = u.id
INNER JOIN courses c ON f.id = c.faculty_id
LEFT JOIN enrollments e ON c.id = e.course_id AND e.status = 'active'
WHERE f.faculty_number = 'FAC001'
GROUP BY f.faculty_number, u.full_name, f.designation, f.department, c.id, c.course_code, c.course_name, c.credits, c.semester
ORDER BY c.course_code ASC;


-- -----------------------------------------------------------------------------
-- 3. Count students per course (Active & Total)
-- Demonstrates: LEFT JOIN, COUNT with conditional aggregation, and GROUP BY
-- -----------------------------------------------------------------------------
SELECT 
    c.id AS course_id,
    c.course_code,
    c.course_name,
    u.full_name AS faculty_name,
    COUNT(e.id) AS total_enrolled,
    COUNT(CASE WHEN e.status = 'active' THEN 1 END) AS active_enrolled,
    COUNT(CASE WHEN e.status = 'dropped' THEN 1 END) AS dropped_enrolled,
    COUNT(CASE WHEN e.status = 'completed' THEN 1 END) AS completed_enrolled
FROM courses c
INNER JOIN faculty f ON c.faculty_id = f.id
INNER JOIN users u ON f.user_id = u.id
LEFT JOIN enrollments e ON c.id = e.course_id
GROUP BY c.id, c.course_code, c.course_name, u.full_name
ORDER BY active_enrolled DESC;


-- -----------------------------------------------------------------------------
-- 4. Calculate average marks for all graded assignments across courses
-- Demonstrates: Multi-table JOIN with aggregate functions (AVG, MIN, MAX, STDDEV)
-- -----------------------------------------------------------------------------
SELECT 
    c.course_code,
    c.course_name,
    a.id AS assignment_id,
    a.title AS assignment_title,
    a.max_marks,
    COUNT(s.id) AS total_submissions,
    ROUND(AVG(s.marks), 2) AS average_marks_obtained,
    ROUND((AVG(s.marks) / a.max_marks) * 100, 2) AS average_percentage,
    MIN(s.marks) AS minimum_marks,
    MAX(s.marks) AS maximum_marks
FROM assignments a
INNER JOIN courses c ON a.course_id = c.id
LEFT JOIN submissions s ON a.id = s.assignment_id AND s.status = 'graded'
GROUP BY c.course_code, c.course_name, a.id, a.title, a.max_marks
ORDER BY c.course_code, a.due_date;


-- -----------------------------------------------------------------------------
-- 5. Find students with attendance above 75% in their enrolled courses
-- Demonstrates: Conditional COUNT, HAVING clause, and percentage calculation
-- -----------------------------------------------------------------------------
SELECT 
    c.course_code,
    c.course_name,
    s.student_number,
    u.full_name AS student_name,
    COUNT(att.id) AS total_sessions_conducted,
    COUNT(CASE WHEN att.status = 'present' THEN 1 END) AS sessions_attended,
    ROUND((COUNT(CASE WHEN att.status = 'present' THEN 1 END) / COUNT(att.id)) * 100, 2) AS attendance_percentage
FROM attendance att
INNER JOIN courses c ON att.course_id = c.id
INNER JOIN students s ON att.student_id = s.id
INNER JOIN users u ON s.user_id = u.id
GROUP BY c.course_code, c.course_name, s.student_number, u.full_name
HAVING total_sessions_conducted > 0 AND attendance_percentage >= 75.00
ORDER BY attendance_percentage DESC, u.full_name ASC;


-- -----------------------------------------------------------------------------
-- 6. Find students with attendance below 75% (Shortage List for Hall Ticket Debarment)
-- Demonstrates: HAVING clause filter for academic deficiency criteria
-- -----------------------------------------------------------------------------
SELECT 
    c.course_code,
    c.course_name,
    s.student_number,
    u.full_name AS student_name,
    u.email AS student_email,
    COUNT(att.id) AS total_sessions_conducted,
    COUNT(CASE WHEN att.status = 'present' THEN 1 END) AS sessions_attended,
    COUNT(CASE WHEN att.status = 'absent' THEN 1 END) AS sessions_absent,
    ROUND((COUNT(CASE WHEN att.status = 'present' THEN 1 END) / COUNT(att.id)) * 100, 2) AS attendance_percentage
FROM attendance att
INNER JOIN courses c ON att.course_id = c.id
INNER JOIN students s ON att.student_id = s.id
INNER JOIN users u ON s.user_id = u.id
GROUP BY c.course_code, c.course_name, s.student_number, u.full_name, u.email
HAVING total_sessions_conducted > 0 AND attendance_percentage < 75.00
ORDER BY attendance_percentage ASC;


-- -----------------------------------------------------------------------------
-- 7. Find pending assignments for a specific student (Not yet submitted & Due in future)
-- Demonstrates: Subquery with NOT IN / LEFT JOIN IS NULL and date filtering
-- -----------------------------------------------------------------------------
SELECT 
    c.course_code,
    c.course_name,
    a.id AS assignment_id,
    a.title AS assignment_title,
    a.description,
    a.due_date,
    a.max_marks,
    DATEDIFF(a.due_date, NOW()) AS days_remaining
FROM assignments a
INNER JOIN courses c ON a.course_id = c.id
INNER JOIN enrollments e ON c.id = e.course_id
INNER JOIN students s ON e.student_id = s.id
LEFT JOIN submissions sub ON a.id = sub.assignment_id AND sub.student_id = s.id
WHERE s.student_number = 'STU2024001'
  AND e.status = 'active'
  AND sub.id IS NULL
ORDER BY a.due_date ASC;


-- -----------------------------------------------------------------------------
-- 8. Find students who have NOT submitted a specific assignment
-- Demonstrates: Outer JOIN filtering / NOT EXISTS correlated subquery
-- -----------------------------------------------------------------------------
SELECT 
    a.id AS assignment_id,
    a.title AS assignment_title,
    c.course_code,
    s.student_number,
    u.full_name AS student_name,
    u.email AS student_email
FROM assignments a
INNER JOIN courses c ON a.course_id = c.id
INNER JOIN enrollments e ON c.id = e.course_id AND e.status = 'active'
INNER JOIN students s ON e.student_id = s.id
INNER JOIN users u ON s.user_id = u.id
WHERE a.id = 1
  AND NOT EXISTS (
      SELECT 1 FROM submissions sub 
      WHERE sub.assignment_id = a.id AND sub.student_id = s.id
  )
ORDER BY u.full_name ASC;


-- -----------------------------------------------------------------------------
-- 9. Display top-performing students across all courses (Composite GPA / Weighted Score)
-- Demonstrates: Aggregate subquery, joins across quiz attempts and assignment submissions
-- -----------------------------------------------------------------------------
SELECT 
    s.student_number,
    u.full_name AS student_name,
    s.department,
    COUNT(DISTINCT e.course_id) AS enrolled_courses,
    ROUND(AVG(COALESCE(sub_stats.avg_assignment_pct, 0)), 2) AS avg_assignment_percentage,
    ROUND(AVG(COALESCE(quiz_stats.avg_quiz_pct, 0)), 2) AS avg_quiz_percentage,
    ROUND(
        (COALESCE(AVG(sub_stats.avg_assignment_pct), 0) * 0.6) + 
        (COALESCE(AVG(quiz_stats.avg_quiz_pct), 0) * 0.4), 
        2
    ) AS composite_academic_score
FROM students s
INNER JOIN users u ON s.user_id = u.id
INNER JOIN enrollments e ON s.id = e.student_id AND e.status = 'active'
LEFT JOIN (
    SELECT 
        sub.student_id,
        AVG((sub.marks / a.max_marks) * 100) AS avg_assignment_pct
    FROM submissions sub
    INNER JOIN assignments a ON sub.assignment_id = a.id
    WHERE sub.status = 'graded'
    GROUP BY sub.student_id
) sub_stats ON s.id = sub_stats.student_id
LEFT JOIN (
    SELECT 
        qa.student_id,
        AVG((qa.score / q.max_marks) * 100) AS avg_quiz_pct
    FROM quiz_attempts qa
    INNER JOIN quizzes q ON qa.quiz_id = q.id
    WHERE qa.submitted_at IS NOT NULL
    GROUP BY qa.student_id
) quiz_stats ON s.id = quiz_stats.student_id
GROUP BY s.id, s.student_number, u.full_name, s.department
ORDER BY composite_academic_score DESC
LIMIT 10;


-- -----------------------------------------------------------------------------
-- 10. Display course-wise average marks and grade distribution
-- Demonstrates: Complex grouping, subqueries, and statistical averages
-- -----------------------------------------------------------------------------
SELECT 
    c.course_code,
    c.course_name,
    COUNT(DISTINCT e.student_id) AS total_students,
    ROUND(AVG(sub.marks), 2) AS average_assignment_score,
    ROUND(AVG(qa.score), 2) AS average_quiz_score
FROM courses c
LEFT JOIN enrollments e ON c.id = e.course_id AND e.status = 'active'
LEFT JOIN assignments a ON c.id = a.course_id
LEFT JOIN submissions sub ON a.id = sub.assignment_id AND sub.status = 'graded'
LEFT JOIN quizzes q ON c.id = q.course_id
LEFT JOIN quiz_attempts qa ON q.id = qa.quiz_id AND qa.submitted_at IS NOT NULL
GROUP BY c.id, c.course_code, c.course_name
ORDER BY c.course_code;


-- -----------------------------------------------------------------------------
-- 11. Display assignment submission statistics (Submitted, Late, Graded, Missing)
-- Demonstrates: CASE statements, multiple JOINs, and metrics breakdown
-- -----------------------------------------------------------------------------
SELECT 
    a.id AS assignment_id,
    a.title AS assignment_title,
    c.course_code,
    COUNT(DISTINCT e.student_id) AS total_eligible_students,
    COUNT(DISTINCT sub.id) AS total_submitted,
    COUNT(DISTINCT CASE WHEN sub.status = 'late' THEN sub.id END) AS late_submissions,
    COUNT(DISTINCT CASE WHEN sub.status = 'graded' THEN sub.id END) AS graded_submissions,
    COUNT(DISTINCT e.student_id) - COUNT(DISTINCT sub.id) AS pending_submissions,
    ROUND((COUNT(DISTINCT sub.id) / COUNT(DISTINCT e.student_id)) * 100, 2) AS submission_rate_percentage
FROM assignments a
INNER JOIN courses c ON a.course_id = c.id
INNER JOIN enrollments e ON c.id = e.course_id AND e.status = 'active'
LEFT JOIN submissions sub ON a.id = sub.assignment_id AND sub.student_id = e.student_id
GROUP BY a.id, a.title, c.course_code;


-- -----------------------------------------------------------------------------
-- 12. Display student comprehensive performance report card across all courses
-- Demonstrates: Comprehensive student view joining assignments, quizzes, and attendance
-- -----------------------------------------------------------------------------
SELECT 
    u.full_name AS student_name,
    s.student_number,
    c.course_code,
    c.course_name,
    -- Attendance Percentage
    COALESCE(att_summary.attendance_pct, 0.00) AS attendance_pct,
    -- Assignment Average Marks Percentage
    COALESCE(asgn_summary.assignment_pct, 0.00) AS assignment_pct,
    -- Quiz Average Marks Percentage
    COALESCE(quiz_summary.quiz_pct, 0.00) AS quiz_pct,
    -- Overall Percentage
    ROUND(
        (COALESCE(asgn_summary.assignment_pct, 0.00) * 0.5) + 
        (COALESCE(quiz_summary.quiz_pct, 0.00) * 0.3) + 
        (COALESCE(att_summary.attendance_pct, 0.00) * 0.2), 
        2
    ) AS overall_course_score
FROM students s
INNER JOIN users u ON s.user_id = u.id
INNER JOIN enrollments e ON s.id = e.student_id
INNER JOIN courses c ON e.course_id = c.id
-- Attendance Subquery
LEFT JOIN (
    SELECT 
        student_id, 
        course_id, 
        ROUND((COUNT(CASE WHEN status = 'present' THEN 1 END) / COUNT(id)) * 100, 2) AS attendance_pct
    FROM attendance
    GROUP BY student_id, course_id
) att_summary ON s.id = att_summary.student_id AND c.id = att_summary.course_id
-- Assignment Subquery
LEFT JOIN (
    SELECT 
        sub.student_id,
        a.course_id,
        ROUND(AVG((sub.marks / a.max_marks) * 100), 2) AS assignment_pct
    FROM submissions sub
    INNER JOIN assignments a ON sub.assignment_id = a.id
    WHERE sub.status = 'graded'
    GROUP BY sub.student_id, a.course_id
) asgn_summary ON s.id = asgn_summary.student_id AND c.id = asgn_summary.course_id
-- Quiz Subquery
LEFT JOIN (
    SELECT 
        qa.student_id,
        q.course_id,
        ROUND(AVG((qa.score / q.max_marks) * 100), 2) AS quiz_pct
    FROM quiz_attempts qa
    INNER JOIN quizzes q ON qa.quiz_id = q.id
    WHERE qa.submitted_at IS NOT NULL
    GROUP BY qa.student_id, q.course_id
) quiz_summary ON s.id = quiz_summary.student_id AND c.id = quiz_summary.course_id
WHERE e.status = 'active'
ORDER BY u.full_name, c.course_code;


-- =============================================================================
-- TRANSACTION DEMONSTRATION EXAMPLES
-- =============================================================================

-- Scenario: Student Submits Quiz with Multi-Answer Evaluation
-- START TRANSACTION;
-- 1. Update attempt status
-- UPDATE quiz_attempts SET submitted_at = NOW() WHERE id = 1 AND student_id = 1;
-- 2. Insert answer choices
-- INSERT INTO answers (attempt_id, question_id, selected_option_id) VALUES (1, 1, 3), (1, 2, 6);
-- 3. Calculate score based on correct options
-- UPDATE quiz_attempts qa
-- SET score = (
--     SELECT COALESCE(SUM(q.marks), 0)
--     FROM answers a
--     INNER JOIN options opt ON a.selected_option_id = opt.id
--     INNER JOIN questions q ON a.question_id = q.id
--     WHERE a.attempt_id = qa.id AND opt.is_correct = TRUE
-- )
-- WHERE qa.id = 1;
-- COMMIT;
