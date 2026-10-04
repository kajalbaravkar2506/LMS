-- =============================================================================
-- COLLEGE LEARNING MANAGEMENT SYSTEM (LMS) - DATABASE SCHEMA
-- Database: lms_database
-- Target Engine: MySQL 8.0+
-- =============================================================================

CREATE DATABASE IF NOT EXISTS `lms_database`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `lms_database`;

-- Disable foreign key checks during schema creation
SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- 1. USERS TABLE
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `full_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('student', 'faculty', 'admin') NOT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `profile_image` VARCHAR(500) DEFAULT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`),
  KEY `idx_users_role` (`role`),
  KEY `idx_users_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. STUDENTS TABLE
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `students`;
CREATE TABLE `students` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `student_number` VARCHAR(50) NOT NULL,
  `department` VARCHAR(100) DEFAULT NULL,
  `year` INT DEFAULT 1,
  `semester` INT DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_students_user_id` (`user_id`),
  UNIQUE KEY `uq_students_student_number` (`student_number`),
  KEY `idx_students_department` (`department`),
  CONSTRAINT `fk_students_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_student_year` CHECK (`year` >= 1 AND `year` <= 6),
  CONSTRAINT `chk_student_semester` CHECK (`semester` >= 1 AND `semester` <= 12)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3. FACULTY TABLE
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `faculty`;
CREATE TABLE `faculty` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `faculty_number` VARCHAR(50) NOT NULL,
  `department` VARCHAR(100) DEFAULT NULL,
  `designation` VARCHAR(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_faculty_user_id` (`user_id`),
  UNIQUE KEY `uq_faculty_faculty_number` (`faculty_number`),
  KEY `idx_faculty_department` (`department`),
  CONSTRAINT `fk_faculty_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 4. COURSES TABLE
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `courses`;
CREATE TABLE `courses` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `course_code` VARCHAR(30) NOT NULL,
  `course_name` VARCHAR(150) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `syllabus` TEXT DEFAULT NULL,
  `credits` INT NOT NULL DEFAULT 3,
  `semester` INT NOT NULL DEFAULT 1,
  `department` VARCHAR(100) NOT NULL,
  `faculty_id` INT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_courses_course_code` (`course_code`),
  KEY `idx_courses_faculty_id` (`faculty_id`),
  KEY `idx_courses_department` (`department`),
  CONSTRAINT `fk_courses_faculty`
    FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `chk_courses_credits` CHECK (`credits` > 0 AND `credits` <= 10)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 5. ENROLLMENTS TABLE (Many-to-Many junction)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `enrollments`;
CREATE TABLE `enrollments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `student_id` INT NOT NULL,
  `course_id` INT NOT NULL,
  `enrollment_date` DATE NOT NULL,
  `status` ENUM('active', 'completed', 'dropped') NOT NULL DEFAULT 'active',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_enrollments_student_course` (`student_id`, `course_id`),
  KEY `idx_enrollments_student_id` (`student_id`),
  KEY `idx_enrollments_course_id` (`course_id`),
  KEY `idx_enrollments_status` (`status`),
  CONSTRAINT `fk_enrollments_student`
    FOREIGN KEY (`student_id`) REFERENCES `students` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_enrollments_course`
    FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 6. COURSE MATERIALS TABLE
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `course_materials`;
CREATE TABLE `course_materials` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `course_id` INT NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `file_url` VARCHAR(500) NOT NULL,
  `material_type` VARCHAR(50) NOT NULL DEFAULT 'document',
  `uploaded_by` INT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_course_materials_course_id` (`course_id`),
  KEY `idx_course_materials_uploaded_by` (`uploaded_by`),
  CONSTRAINT `fk_course_materials_course`
    FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_course_materials_uploader`
    FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 7. ASSIGNMENTS TABLE
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `assignments`;
CREATE TABLE `assignments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `course_id` INT NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `due_date` DATETIME NOT NULL,
  `max_marks` DECIMAL(5,2) NOT NULL DEFAULT 100.00,
  `created_by` INT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_assignments_course_id` (`course_id`),
  KEY `idx_assignments_created_by` (`created_by`),
  KEY `idx_assignments_due_date` (`due_date`),
  CONSTRAINT `fk_assignments_course`
    FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_assignments_creator`
    FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `chk_assignments_max_marks` CHECK (`max_marks` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 8. SUBMISSIONS TABLE
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `submissions`;
CREATE TABLE `submissions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `assignment_id` INT NOT NULL,
  `student_id` INT NOT NULL,
  `file_url` VARCHAR(500) DEFAULT NULL,
  `submitted_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `marks` DECIMAL(5,2) DEFAULT NULL,
  `feedback` TEXT DEFAULT NULL,
  `status` ENUM('submitted', 'late', 'graded') NOT NULL DEFAULT 'submitted',
  `graded_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_submissions_assignment_student` (`assignment_id`, `student_id`),
  KEY `idx_submissions_assignment_id` (`assignment_id`),
  KEY `idx_submissions_student_id` (`student_id`),
  KEY `idx_submissions_status` (`status`),
  CONSTRAINT `fk_submissions_assignment`
    FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_submissions_student`
    FOREIGN KEY (`student_id`) REFERENCES `students` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `chk_submissions_marks` CHECK (`marks` IS NULL OR `marks` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 9. QUIZZES TABLE
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `quizzes`;
CREATE TABLE `quizzes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `course_id` INT NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `duration_minutes` INT NOT NULL DEFAULT 30,
  `max_marks` DECIMAL(5,2) NOT NULL DEFAULT 20.00,
  `created_by` INT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_quizzes_course_id` (`course_id`),
  KEY `idx_quizzes_created_by` (`created_by`),
  CONSTRAINT `fk_quizzes_course`
    FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_quizzes_creator`
    FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `chk_quizzes_duration` CHECK (`duration_minutes` > 0),
  CONSTRAINT `chk_quizzes_max_marks` CHECK (`max_marks` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 10. QUESTIONS TABLE
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `questions`;
CREATE TABLE `questions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `quiz_id` INT NOT NULL,
  `question_text` TEXT NOT NULL,
  `marks` DECIMAL(5,2) NOT NULL DEFAULT 1.00,
  PRIMARY KEY (`id`),
  KEY `idx_questions_quiz_id` (`quiz_id`),
  CONSTRAINT `fk_questions_quiz`
    FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_questions_marks` CHECK (`marks` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 11. OPTIONS TABLE
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `options`;
CREATE TABLE `options` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `question_id` INT NOT NULL,
  `option_text` TEXT NOT NULL,
  `is_correct` BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (`id`),
  KEY `idx_options_question_id` (`question_id`),
  CONSTRAINT `fk_options_question`
    FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 12. QUIZ ATTEMPTS TABLE
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `quiz_attempts`;
CREATE TABLE `quiz_attempts` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `quiz_id` INT NOT NULL,
  `student_id` INT NOT NULL,
  `started_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `submitted_at` DATETIME DEFAULT NULL,
  `score` DECIMAL(5,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_quiz_attempts_quiz_student` (`quiz_id`, `student_id`),
  KEY `idx_quiz_attempts_quiz_id` (`quiz_id`),
  KEY `idx_quiz_attempts_student_id` (`student_id`),
  CONSTRAINT `fk_quiz_attempts_quiz`
    FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_quiz_attempts_student`
    FOREIGN KEY (`student_id`) REFERENCES `students` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `chk_quiz_attempts_score` CHECK (`score` IS NULL OR `score` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 13. ANSWERS TABLE
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `answers`;
CREATE TABLE `answers` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `attempt_id` INT NOT NULL,
  `question_id` INT NOT NULL,
  `selected_option_id` INT DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_answers_attempt_id` (`attempt_id`),
  KEY `idx_answers_question_id` (`question_id`),
  KEY `idx_answers_selected_option_id` (`selected_option_id`),
  CONSTRAINT `fk_answers_attempt`
    FOREIGN KEY (`attempt_id`) REFERENCES `quiz_attempts` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_answers_question`
    FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_answers_option`
    FOREIGN KEY (`selected_option_id`) REFERENCES `options` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 14. ATTENDANCE TABLE
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `attendance`;
CREATE TABLE `attendance` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `course_id` INT NOT NULL,
  `student_id` INT NOT NULL,
  `date` DATE NOT NULL,
  `status` ENUM('present', 'absent') NOT NULL DEFAULT 'present',
  `marked_by` INT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_attendance_course_student_date` (`course_id`, `student_id`, `date`),
  KEY `idx_attendance_course_id` (`course_id`),
  KEY `idx_attendance_student_id` (`student_id`),
  KEY `idx_attendance_date` (`date`),
  KEY `idx_attendance_marked_by` (`marked_by`),
  CONSTRAINT `fk_attendance_course`
    FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_attendance_student`
    FOREIGN KEY (`student_id`) REFERENCES `students` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_attendance_marker`
    FOREIGN KEY (`marked_by`) REFERENCES `users` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 15. ANNOUNCEMENTS TABLE
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `announcements`;
CREATE TABLE `announcements` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `course_id` INT DEFAULT NULL,
  `title` VARCHAR(200) NOT NULL,
  `content` TEXT NOT NULL,
  `created_by` INT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_announcements_course_id` (`course_id`),
  KEY `idx_announcements_created_by` (`created_by`),
  KEY `idx_announcements_created_at` (`created_at`),
  CONSTRAINT `fk_announcements_course`
    FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_announcements_creator`
    FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 16. NOTIFICATIONS TABLE
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `message` TEXT NOT NULL,
  `type` VARCHAR(50) NOT NULL DEFAULT 'info',
  `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_notifications_user_id` (`user_id`),
  KEY `idx_notifications_is_read` (`is_read`),
  KEY `idx_notifications_created_at` (`created_at`),
  CONSTRAINT `fk_notifications_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;
