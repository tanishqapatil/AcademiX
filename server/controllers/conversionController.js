const Material = require('../models/Material');

exports.requestConversion = async (req, res, next) => {
  try {
    const { materialId } = req.params;
    const { kind } = req.body; // 'audio' | 'video'

    const mat = await Material.findById(materialId);
    if (!mat) return res.status(404).json({ message: 'Material not found' });

    // Enrollment/ownership check omitted for brevity (reuse from listMaterials)

    mat.conversions.push({ kind, status: 'queued' });
    await mat.save();

    // naive "background" simulation
    setTimeout(async () => {
      try {
        const fresh = await Material.findById(materialId);
        const conv = fresh.conversions.find(c => c.kind === kind && c.status === 'queued');
        if (conv) {
          conv.status = 'ready';
          // point to a placeholder file for now
          conv.outputUrl = kind === 'audio' ? '/uploads/sample.mp3' : '/uploads/sample.mp4';
          await fresh.save();
        }
      } catch (_) {}
    }, 4000);

    res.status(202).json({ ok: true });
  } catch (e) { next(e); }
};

exports.listConversions = async (req, res, next) => {
  try {
    const { materialId } = req.params;
    const mat = await Material.findById(materialId).lean();
    if (!mat) return res.status(404).json({ message: 'Material not found' });
    res.json(mat.conversions || []);
  } catch (e) { next(e); }
};
