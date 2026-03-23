// server/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));

// ---- Static /uploads (make sure folder exists) ----
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir, { fallthrough: false }));

// Health / root
app.get('/', (_req, res) => res.send('Api is running'));

// ---- API routes ----
app.use('/api/auth', require('./routes/auth'));
app.use('/api/courses', require('./routes/course'));

const materialRoutes = require('./routes/material');      // /api/courses/:courseId/materials etc.
app.use('/api', materialRoutes);

const conversionRoutes = require('./routes/conversion');  // /api/materials/:materialId/convert...
app.use('/api', conversionRoutes);

// ---- DB ----
mongoose.connect(process.env.MONGO_URI, { autoIndex: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// ---- Error handler ----
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

// ---- Start ----
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
