const express = require('express');
const router = express.Router(); // no parent params needed
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const ctrl = require('../controllers/materialController');

// Ensure uploads folder exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safe = Date.now() + '-' + file.originalname.replace(/[^\w.\-]+/g, '_');
    cb(null, safe);
  }
});
const allowed = new Set([
  'application/pdf',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
]);
const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
  fileFilter: (_req, file, cb) => {
    if (allowed.has(file.mimetype)) cb(null, true);
    else cb(new Error('Unsupported file type'), false);
  }
});

// POST /api/courses/:courseId/materials (teacher owner)
router.post('/courses/:courseId/materials',
  auth, requireRole('teacher'),
  upload.single('file'),
  ctrl.uploadMaterial
);

// GET /api/courses/:courseId/materials (teacher owner or enrolled student)
router.get('/courses/:courseId/materials',
  auth,
  ctrl.listMaterials
);

// DELETE /api/materials/:materialId (teacher owner)
router.delete('/materials/:materialId',
  auth, requireRole('teacher'),
  ctrl.deleteMaterial
);

module.exports = router;
