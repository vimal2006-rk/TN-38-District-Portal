const express = require('express');
const router = express.Router();
const { serveMediaById } = require('../controllers/media.controller');

router.get('/:id', serveMediaById);

module.exports = router;
