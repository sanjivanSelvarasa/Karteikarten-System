const {
  createFlashcard,
  listFlashcardsBySetId,
  findFlashcardWithOwner,
  updateFlashcard,
  deleteFlashcard,
} = require('../4_models/flashcard.model');
const { findLearningSetByIdAndUserId } = require('../4_models/learningSet.model');
const { createHttpError } = require('../5_utils/httpError');
const { isNonEmptyString } = require('../5_utils/validators');

function createForSet(userId, setId, payload) {
  const set = findLearningSetByIdAndUserId(setId, userId);
  if (!set) {
    throw createHttpError(404, 'Learning set not found');
  }

  const { question, answer, position } = payload;

  if (!isNonEmptyString(question)) {
    throw createHttpError(400, 'Question is required');
  }

  if (!isNonEmptyString(answer)) {
    throw createHttpError(400, 'Answer is required');
  }

  const cards = listFlashcardsBySetId(setId);
  const computedPosition = Number.isInteger(position) ? position : cards.length + 1;

  return createFlashcard({
    setId,
    question: question.trim(),
    answer: answer.trim(),
    position: computedPosition,
  });
}

function listForSet(userId, setId) {
  const set = findLearningSetByIdAndUserId(setId, userId);
  if (!set) {
    throw createHttpError(404, 'Learning set not found');
  }

  return listFlashcardsBySetId(setId);
}

function updateForUser(userId, flashcardId, payload) {
  const existing = findFlashcardWithOwner(flashcardId);
  if (!existing || existing.user_id !== userId) {
    throw createHttpError(404, 'Flashcard not found');
  }

  const question = payload.question ?? existing.question;
  const answer = payload.answer ?? existing.answer;
  const position = Number.isInteger(payload.position) ? payload.position : existing.position;

  if (!isNonEmptyString(question)) {
    throw createHttpError(400, 'Question is required');
  }

  if (!isNonEmptyString(answer)) {
    throw createHttpError(400, 'Answer is required');
  }

  return updateFlashcard({
    flashcardId,
    question: question.trim(),
    answer: answer.trim(),
    position,
  });
}

function removeForUser(userId, flashcardId) {
  const existing = findFlashcardWithOwner(flashcardId);
  if (!existing || existing.user_id !== userId) {
    throw createHttpError(404, 'Flashcard not found');
  }

  deleteFlashcard(flashcardId);
}

module.exports = {
  createForSet,
  listForSet,
  updateForUser,
  removeForUser,
};
