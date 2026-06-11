const {
  createLearningSet,
  listLearningSetsByUserId,
  findLearningSetByIdAndUserId,
  updateLearningSet,
  deleteLearningSet,
} = require('../4_models/learningSet.model');
const { createHttpError } = require('../5_utils/httpError');
const { isNonEmptyString } = require('../5_utils/validators');

function createForUser(userId, payload) {
  const { title, description, isPublic = false } = payload;

  if (!isNonEmptyString(title) || title.trim().length < 2) {
    throw createHttpError(400, 'Title must be at least 2 characters long');
  }

  return createLearningSet({
    userId,
    title: title.trim(),
    description: isNonEmptyString(description) ? description.trim() : null,
    isPublic: Boolean(isPublic),
  });
}

function listForUser(userId) {
  return listLearningSetsByUserId(userId);
}

function getOneForUser(userId, setId) {
  const set = findLearningSetByIdAndUserId(setId, userId);
  if (!set) {
    throw createHttpError(404, 'Learning set not found');
  }

  return set;
}

function updateForUser(userId, setId, payload) {
  const existing = findLearningSetByIdAndUserId(setId, userId);
  if (!existing) {
    throw createHttpError(404, 'Learning set not found');
  }

  const title = payload.title ?? existing.title;
  const description = payload.description ?? existing.description;
  const isPublic = payload.isPublic ?? Boolean(existing.is_public);

  if (!isNonEmptyString(title) || title.trim().length < 2) {
    throw createHttpError(400, 'Title must be at least 2 characters long');
  }

  return updateLearningSet({
    setId,
    userId,
    title: title.trim(),
    description: isNonEmptyString(description) ? description.trim() : null,
    isPublic: Boolean(isPublic),
  });
}

function removeForUser(userId, setId) {
  const existing = findLearningSetByIdAndUserId(setId, userId);
  if (!existing) {
    throw createHttpError(404, 'Learning set not found');
  }

  deleteLearningSet(setId, userId);
}

module.exports = {
  createForUser,
  listForUser,
  getOneForUser,
  updateForUser,
  removeForUser,
};
