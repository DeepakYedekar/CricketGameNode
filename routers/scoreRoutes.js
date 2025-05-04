const express = require('express');
const router = express.Router();
const scoreController = require('../controllers/scoreController');

router.post('/save-score', scoreController.saveScore);
router.get('/score-card/:encrypted_id',scoreController.generateScoreCard);
router.get('/weekly-score/:encrypted_id',scoreController.dashboard);

module.exports = router;