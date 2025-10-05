const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { requestConversion, listConversions } = require('../controllers/conversionController');

router.post('/materials/:materialId/convert', auth, requestConversion);
router.get('/materials/:materialId/conversions', auth, listConversions);

module.exports = router;
