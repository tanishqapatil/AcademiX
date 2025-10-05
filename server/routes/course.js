const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const {
  createCourse, getMyCourses, getEnrolledStudents,
  rotateKey, joinByKey, myCourses, courseStudents
} = require('../controllers/courseController');

// Teacher
router.post('/create', auth, requireRole('teacher'), createCourse);
router.get('/courses', auth, requireRole('teacher'), getMyCourses);
router.post('/:id/rotate-key', auth, requireRole('teacher'), rotateKey);
router.get('/:id/students', auth, requireRole('teacher'), courseStudents);

// Student
router.get('/student/courses', auth, requireRole('student'), myCourses);
router.post('/:id/join', auth, requireRole('student'), joinByKey);

module.exports = router;
