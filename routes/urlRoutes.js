const express = require('express');
const router = express.Router();
const { createShortUrl, getUrlStats, redirectUrl } = require('../controllers/urlController');

router.post('/shorturls', createShortUrl);
router.get('/shorturls/:shortcode', getUrlStats);
router.get('/:shortcode', redirectUrl);

module.exports = router;
