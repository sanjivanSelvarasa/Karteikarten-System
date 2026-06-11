const express = require('express');
const learningSetController = require('../2_controllers/learningSet.controller');
const flashcardController = require('../2_controllers/flashcard.controller');
const { requireAuth } = require('../1_middleware/auth.middleware');

const router = express.Router();

router.use(requireAuth);

router.post('/', learningSetController.createLearningSet);
router.get('/', learningSetController.listLearningSets);
router.get('/:setId', learningSetController.getLearningSet);
router.put('/:setId', learningSetController.updateLearningSet);
router.delete('/:setId', learningSetController.deleteLearningSet);

router.post('/:setId/flashcards', flashcardController.createFlashcard);
router.get('/:setId/flashcards', flashcardController.listFlashcards);

module.exports = router;
