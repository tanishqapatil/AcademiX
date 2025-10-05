const Course = require('../models/Course');
const { newAccessKey, isKeyValid } = require('../services/courseKey');

// POST /api/courses/create  (teacher)
exports.createCourse = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const course = await Course.create({
      title,
      description,
      createdBy: req.user._id,
      currentAccessKey: newAccessKey(45), // set first rotating key here
    });
    res.status(201).json(course);
  } catch (err) { next(err); }
};

// GET /api/courses/courses  (teacher)
exports.getMyCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    res.json(courses);
  } catch (err) { next(err); }
};

// POST /api/courses/:id/rotate-key  (teacher)
exports.rotateKey = async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await Course.findOne({ _id: id, createdBy: req.user._id });
    if (!course) return res.status(404).json({ message: 'Course not found' });

    course.currentAccessKey = newAccessKey(45);
    await course.save();
    res.json(course.currentAccessKey);
  } catch (err) { next(err); }
};

// GET /api/courses/:id/students  (teacher)
exports.courseStudents = async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await Course.findOne({ _id: id, createdBy: req.user._id })
      .populate('students', 'fullName email');
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const students = (course.students || []).map(s => ({
      id: s._id, name: s.fullName, email: s.email
    }));
    res.json(students);
  } catch (err) { next(err); }
};

// POST /api/courses/:id/join  (student)  body: { code }
exports.joinByKey = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { code } = req.body;

    const course = await Course.findById(id);
    if (!course || !isKeyValid(course, code)) {
      return res.status(400).json({ message: 'Invalid or expired access key' });
    }

    await Course.updateOne(
      { _id: id },
      { $addToSet: { students: req.user._id } } // no duplicates
    );

    res.json({ ok: true });
  } catch (err) { next(err); }
};

// GET /api/courses/student/courses  (student)
exports.myCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({ students: req.user._id }).sort({ createdAt: -1 });
    res.json(courses);
  } catch (err) { next(err); }
};
