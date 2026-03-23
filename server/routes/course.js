// server/routes/course.js
const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

const {
  createCourse,
  listMyCoursesTeacher,
  rotateAccessKey,
  getStudents,
  joinCourse,
  myCourses,
  getCourseById,
} = require('../controllers/courseController');

// ---------- STATIC / NON-PARAM ROUTES FIRST ----------

// Create course (preferred + legacy alias)
router.post('/',        auth, requireRole('teacher'), createCourse);  // POST /api/courses
router.post('/create',  auth, requireRole('teacher'), createCourse);  // POST /api/courses/create

// Teacher’s own courses (your client calls GET /api/courses/courses)
router.get('/courses',  auth, requireRole('teacher'), listMyCoursesTeacher);

// Optional cleaner alias for teacher’s own courses (not used by your client, but handy)
router.get('/mine',     auth, requireRole('teacher'), listMyCoursesTeacher);

// Student’s enrolled courses
router.get('/mine/student', auth, requireRole('student'), myCourses);

// ---------- PARAM ROUTES (order matters) ----------

// Per-course actions
router.post('/:courseId/rotate-key', auth, requireRole('teacher'), rotateAccessKey);
router.get('/:courseId/students',    auth, requireRole('teacher'), getStudents);
router.post('/:courseId/join',       auth, requireRole('student'), joinCourse);

// MUST BE LAST: catch-all to fetch a single course
router.get('/:courseId', auth, getCourseById);

module.exports = router;
