const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { requestConversion, listConversions } = require('../controllers/conversionController');

router.post('/materials/:materialId/convert', auth, requestConversion);        // body style { kind }
router.post('/materials/:materialId/convert/:kind', auth, requestConversion);  // path style
router.get('/materials/:materialId/conversions', auth, listConversions);

module.exports = router;
