// server/models/Course.js
const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },

  // ↓ Add this block
  currentAccessKey: {
    code: { type: String, index: true }, // e.g., '9F2A7C10'
    expiresAt: { type: Date }            // e.g., Date in the next 45 min
  },
  // ↑ End added block

  students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }
  ]
}, { timestamps: true });

/**
 * Optional convenience check you can call on a Course document:
 * course.isAccessKeyValid('ABC12345')
 */
courseSchema.methods.isAccessKeyValid = function (code) {
  if (!this.currentAccessKey || !this.currentAccessKey.code || !this.currentAccessKey.expiresAt) return false;
  return this.currentAccessKey.code === code && this.currentAccessKey.expiresAt > new Date();
};

module.exports = mongoose.model('Course', courseSchema);
