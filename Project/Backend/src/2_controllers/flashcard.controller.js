const flashcardService = require('../3_services/flashcard.service');

function createFlashcard(req, res, next) {
  try {
    const setId = Number(req.params.setId);
    const data = flashcardService.createForSet(req.user.userId, setId, req.body || {});
    res.status(201).json({
      ok: true,
      message: 'Flashcard created',
      data: { flashcard: data },
    });
  } catch (error) {
    next(error);
  }
}

function listFlashcards(req, res, next) {
  try {
    const setId = Number(req.params.setId);
    const data = flashcardService.listForSet(req.user.userId, setId);
    res.status(200).json({
      ok: true,
      data: { flashcards: data },
    });
  } catch (error) {
    next(error);
  }
}

function updateFlashcard(req, res, next) {
  try {
    const flashcardId = Number(req.params.flashcardId);
    const data = flashcardService.updateForUser(req.user.userId, flashcardId, req.body || {});
    res.status(200).json({
      ok: true,
      message: 'Flashcard updated',
      data: { flashcard: data },
    });
  } catch (error) {
    next(error);
  }
}

function deleteFlashcard(req, res, next) {
  try {
    const flashcardId = Number(req.params.flashcardId);
    flashcardService.removeForUser(req.user.userId, flashcardId);
    res.status(200).json({
      ok: true,
      message: 'Flashcard deleted',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createFlashcard,
  listFlashcards,
  updateFlashcard,
  deleteFlashcard,
};
