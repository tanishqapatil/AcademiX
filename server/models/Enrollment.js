const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', index: true, required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User',  index: true, required: true },
}, { timestamps: true });

enrollmentSchema.index({ courseId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
