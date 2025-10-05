const path = require('path');
const fs = require('fs');
const Material = require('../models/Material');
const Course = require('../models/Course');

const TYPES = new Set(['pdf', 'ppt', 'docx', 'link', 'note']);

function isOwner(course, userId) { return String(course.createdBy) === String(userId); }
function isEnrolled(course, userId) { return (course.students || []).some(s => String(s) === String(userId)); }

exports.uploadMaterial = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { title = '', type = '', sourceUrl, textContent } = req.body;

    if (!title.trim()) return res.status(400).json({ message: 'Title is required' });
    if (!TYPES.has(type)) return res.status(400).json({ message: 'Invalid type' });

    const course = await Course.findById(courseId);
    if (!course || !isOwner(course, req.user._id)) {
      return res.status(404).json({ message: 'Course not found' });
    }

    let fileUrl = null;
    if (req.file) fileUrl = `/uploads/${req.file.filename}`;

    // basic content requirements
    if (type === 'link' && !sourceUrl) {
      return res.status(400).json({ message: 'sourceUrl required for link type' });
    }
    if (type === 'note' && !textContent) {
      return res.status(400).json({ message: 'textContent required for note type' });
    }
    if (['pdf', 'ppt', 'docx'].includes(type) && !fileUrl) {
      return res.status(400).json({ message: 'file is required for this type' });
    }

    const material = await Material.create({
      courseId,
      title: title.trim(),
      type,
      sourceUrl: fileUrl || sourceUrl || null,
      textContent: textContent || ''
    });

    res.status(201).json(material);
  } catch (e) { next(e); }
};

exports.listMaterials = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const allowed = isOwner(course, req.user._id) || (req.user.role === 'student' && isEnrolled(course, req.user._id));
    if (!allowed) return res.status(403).json({ message: 'Forbidden' });

    const items = await Material.find({ courseId }).sort({ createdAt: -1 });
    res.json(items);
  } catch (e) { next(e); }
};

exports.deleteMaterial = async (req, res, next) => {
  try {
    const { materialId } = req.params;
    const mat = await Material.findById(materialId);
    if (!mat) return res.status(404).json({ message: 'Material not found' });

    const course = await Course.findById(mat.courseId);
    if (!course || !isOwner(course, req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (mat.sourceUrl && mat.sourceUrl.startsWith('/uploads/')) {
      const filePath = path.join(process.cwd(), mat.sourceUrl.replace('/uploads/', 'uploads/'));
      fs.promises.unlink(filePath).catch(() => {});
    }

    await Material.deleteOne({ _id: materialId });
    res.json({ ok: true });
  } catch (e) { next(e); }
};
