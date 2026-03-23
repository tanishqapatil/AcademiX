const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { v4: uuid } = require('uuid');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const gtts = require('google-tts-api');
const Material = require('../models/Material');
const Course = require('../models/Course');

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

function isOwner(course, userId) { return String(course.createdBy) === String(userId); }
function isEnrolled(course, userId) { return (course.students || []).some(s => String(s) === String(userId)); }

function getKind(req) {
  return (req.params.kind || req.body.kind || '').toString().toLowerCase();
}

// ----- helpers to extract text from material -----
async function readFileBufferFromSource(mat) {
  // only for files saved under /uploads/*
  if (!mat.sourceUrl || !mat.sourceUrl.startsWith('/uploads/')) return null;
  const diskPath = path.join(uploadsDir, mat.sourceUrl.replace('/uploads/', ''));
  if (!fs.existsSync(diskPath)) throw new Error(`File missing: ${diskPath}`);
  return fs.readFileSync(diskPath);
}

async function materialToPlainText(mat) {
  if (mat.type === 'note') {
    return (mat.textContent || '').trim();
  }

  if (mat.type === 'pdf') {
    const buf = await readFileBufferFromSource(mat);
    const out = await pdfParse(buf);
    return (out.text || '').trim();
  }

  if (mat.type === 'docx') {
    const buf = await readFileBufferFromSource(mat);
    const { value } = await mammoth.extractRawText({ buffer: buf });
    return (value || '').trim();
  }

  // ppt files: for now we don’t parse existing PPT; return a friendly stub
  if (mat.type === 'ppt') {
    return 'This is a presentation file uploaded by the teacher.';
  }

  // external link: no scraping for now
  if (mat.type === 'link') {
    return 'This material is a link. Please open it in a browser.';
  }

  return '';
}

// ----- audio from text (prototype) -----
async function textToMp3File(text) {
  const content = (text || '').replace(/\s+/g, ' ').trim();
  if (!content) throw new Error('No text to convert');

  // gTTS limit ~200 chars per request → chunk
  const max = 190;
  const chunks = [];
  for (let i = 0; i < content.length; i += max) {
    chunks.push(content.slice(i, i + max));
  }

  const fileName = `audio-${uuid()}.mp3`;
  const target = path.join(uploadsDir, fileName);
  const ws = fs.createWriteStream(target);

  // Fetch each chunk and append to the same file (simple concatenation works for demo)
  for (const c of chunks) {
    const url = gtts.getAudioUrl(c, { lang: 'en', slow: false });
    const res = await axios.get(url, { responseType: 'arraybuffer' });
    ws.write(Buffer.from(res.data));
  }
  ws.end();

  await new Promise((ok, err) => ws.on('finish', ok).on('error', err));
  return `/uploads/${fileName}`;
}

// ----- PPT from text (prototype) -----
async function textToPptFile(text) {
  const PptxGenJS = require('pptxgenjs');
  const pptx = new PptxGenJS();

  // split text into bullets/slides
  const paras = (text || '')
    .split(/\n{2,}/g)
    .map(s => s.trim())
    .filter(Boolean);

  const chunks = paras.length ? paras : ['No extracted text available.'];

  chunks.forEach((block, idx) => {
    const slide = pptx.addSlide();
    slide.addText(`Slide ${idx + 1}`, { x: 1, y: 0.5, fontSize: 24, bold: true });
    // split long block into bullet lines
    const bullets = block.split(/\n+/g).filter(Boolean);
    slide.addText(bullets, {
      x: 1, y: 1.2, fontSize: 16, bullet: true, color: '363636', w: 8, h: 4.5,
    });
  });

  const fileName = `ppt-${uuid()}.pptx`;
  const diskPath = path.join(uploadsDir, fileName);
  const stream = await pptx.stream();
  await new Promise((ok, err) =>
    stream.pipe(fs.createWriteStream(diskPath)).on('finish', ok).on('error', err)
  );
  return `/uploads/${fileName}`;
}

exports.requestConversion = async (req, res, next) => {
  try {
    const { materialId } = req.params;
    const kind = getKind(req);
    if (!['audio', 'video'].includes(kind)) {
      return res.status(400).json({ message: "Invalid 'kind'. Use 'audio' or 'video'." });
    }

    const mat = await Material.findById(materialId);
    if (!mat) return res.status(404).json({ message: 'Material not found' });

    const course = await Course.findById(mat.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const allowed = isOwner(course, req.user._id) || (req.user.role === 'student' && isEnrolled(course, req.user._id));
    if (!allowed) return res.status(403).json({ message: 'Forbidden' });

    // idempotency: if ready exists, return it
    const ready = (mat.conversions || []).find(c => c.kind === kind && c.status === 'ready');
    if (ready) return res.status(200).json({ ok: true, message: 'Already ready', conversion: ready });

    // create record (queued → processing → ready)
    mat.conversions.push({ kind, status: 'queued' });
    await mat.save();
    const convId = mat.conversions[mat.conversions.length - 1]._id;

    // do the work synchronously for now (simple prototype)
    const fresh = await Material.findById(materialId);
    const conv = fresh.conversions.id(convId);
    conv.status = 'processing';
    await fresh.save();

    const text = await materialToPlainText(fresh);

    let outUrl;
    if (kind === 'audio') outUrl = await textToMp3File(text);
    else outUrl = await textToPptFile(text);

    const fresh2 = await Material.findById(materialId);
    const conv2 = fresh2.conversions.id(convId);
    conv2.status = 'ready';
    conv2.outputUrl = outUrl;
    await fresh2.save();

    return res.status(201).json({ ok: true, conversion: conv2 });
  } catch (e) { next(e); }
};

exports.listConversions = async (req, res, next) => {
  try {
    const { materialId } = req.params;
    const mat = await Material.findById(materialId).lean();
    if (!mat) return res.status(404).json({ message: 'Material not found' });

    const course = await Course.findById(mat.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const allowed = true // you could repeat the same access check here if desired
      && (String(course.createdBy) === String(req.user._id) || (course.students || []).some(s => String(s) === String(req.user._id)));

    if (!allowed) return res.status(403).json({ message: 'Forbidden' });

    res.json(mat.conversions || []);
  } catch (e) { next(e); }
};
