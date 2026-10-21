const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const contentRoutes = require('./contentRoutes');

router.use('/auth', authRoutes);
router.use('/contents', contentRoutes);

module.exports = router;
