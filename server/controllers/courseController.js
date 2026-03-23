// server/controllers/courseController.js
const mongoose = require('mongoose');
const Course = require('../models/Course');

const KEY_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function makeKey(len = 6) {
  let s = '';
  for (let i = 0; i < len; i++) s += KEY_CHARS[(Math.random() * KEY_CHARS.length) | 0];
  return s;
}

// --- helpers ---
function ensureId(id, res) {
  if (!mongoose.isValidObjectId(id)) {
    res.status(400).json({ message: 'Invalid course id' });
    return false;
  }
  return true;
}

// --- teacher: create a course ---
async function createCourse(req, res, next) {
  try {
    const { title, description } = req.body || {};
    const t = (title || '').trim();
    if (!t) return res.status(400).json({ message: 'Title is required' });

    const course = await Course.create({
      title: t,
      description: description || '',
      createdBy: req.user._id,
      currentAccessKey: {
        code: makeKey(6),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min
      },
    });
    res.status(201).json(course);
  } catch (e) { next(e); }
}

// --- teacher: list own courses ---
async function listMyCoursesTeacher(req, res, next) {
  try {
    const list = await Course.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    res.json(list);
  } catch (e) { next(e); }
}

// --- rotate key (teacher owner) ---
async function rotateAccessKey(req, res, next) {
  try {
    const { courseId } = req.params;
    if (!ensureId(courseId, res)) return;

    const c = await Course.findById(courseId);
    if (!c || String(c.createdBy) !== String(req.user._id)) {
      return res.status(404).json({ message: 'Course not found' });
    }
    c.currentAccessKey = {
      code: makeKey(6),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    };
    await c.save();
    res.json(c.currentAccessKey);
  } catch (e) { next(e); }
}

// --- teacher: enrolled students ---
async function getStudents(req, res, next) {
  try {
    const { courseId } = req.params;
    if (!ensureId(courseId, res)) return;

    const c = await Course.findById(courseId).populate('students', 'name email role');
    if (!c || String(c.createdBy) !== String(req.user._id)) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(c.students || []);
  } catch (e) { next(e); }
}

// --- student: join with key ---
async function joinCourse(req, res, next) {
  try {
    const { courseId } = req.params;
    if (!ensureId(courseId, res)) return;

    const { code } = req.body || {};
    const c = await Course.findById(courseId);
    if (!c) return res.status(404).json({ message: 'Course not found' });
    if (req.user.role !== 'student') return res.status(403).json({ message: 'Students only' });

    const k = c.currentAccessKey || {};
    const ok = k.code && k.expiresAt && new Date(k.expiresAt) > new Date() &&
               String(code || '').trim().toUpperCase() === k.code;
    if (!ok) return res.status(400).json({ message: 'Invalid or expired key' });

    if (!(c.students || []).some(s => String(s) === String(req.user._id))) {
      c.students.push(req.user._id);
      await c.save();
    }
    res.json({ ok: true });
  } catch (e) { next(e); }
}

// --- student: my enrolled courses ---
async function myCourses(req, res, next) {
  try {
    const list = await Course.find({ students: req.user._id }).sort({ createdAt: -1 });
    res.json(list);
  } catch (e) { next(e); }
}

// --- get course details (owner or enrolled) ---
async function getCourseById(req, res, next) {
  try {
    const { courseId } = req.params;
    if (!ensureId(courseId, res)) return;

    const c = await Course.findById(courseId);
    if (!c) return res.status(404).json({ message: 'Course not found' });

    const owner = String(c.createdBy) === String(req.user._id);
    const enrolled = (c.students || []).some(s => String(s) === String(req.user._id));
    if (!(owner || enrolled)) return res.status(403).json({ message: 'Forbidden' });

    res.json(c);
  } catch (e) { next(e); }
}

module.exports = {
  createCourse,
  listMyCoursesTeacher,
  rotateAccessKey,
  getStudents,
  joinCourse,
  myCourses,
  getCourseById,
};
