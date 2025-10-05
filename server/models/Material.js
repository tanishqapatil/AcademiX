const mongoose = require('mongoose');

const conversionSchema = new mongoose.Schema({
  kind: { type: String, enum: ['audio', 'video'], required: true },
  status: { type: String, enum: ['queued', 'processing', 'ready', 'failed'], default: 'queued' },
  outputUrl: { type: String },
  error: { type: String },
}, { timestamps: true, _id: true });

const materialSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
  title: { type: String, required: true },
  type: { type: String, enum: ['pdf', 'ppt', 'docx', 'link', 'note'], required: true },
  sourceUrl: { type: String },     // file URL (/uploads/...) or external link
  textContent: { type: String },   // for notes
  conversions: [conversionSchema],
}, { timestamps: true });

module.exports = mongoose.model('Material', materialSchema);
