const express = require('express');
const flashcardController = require('../2_controllers/flashcard.controller');
const { requireAuth } = require('../1_middleware/auth.middleware');

const router = express.Router();

router.use(requireAuth);

router.put('/flashcards/:flashcardId', flashcardController.updateFlashcard);
router.delete('/flashcards/:flashcardId', flashcardController.deleteFlashcard);

module.exports = router;
