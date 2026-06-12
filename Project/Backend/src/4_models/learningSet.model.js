const { db } = require('./db');

function createLearningSet({ userId, title, description, isPublic }) {
  const result = db
    .prepare(
      `INSERT INTO learning_sets (user_id, title, description, is_public)
       VALUES (?, ?, ?, ?)`,
    )
    .run(userId, title, description || null, isPublic ? 1 : 0);

  return findLearningSetByIdAndUserId(result.lastInsertRowid, userId);
}

function listLearningSetsByUserId(userId) {
  return db
    .prepare(
      `SELECT set_id, user_id, title, description, is_public, created_at, updated_at
       FROM learning_sets
       WHERE user_id = ?
       ORDER BY updated_at DESC`,
    )
    .all(userId);
}

function listPublicLearningSets() {
  return db
    .prepare(
      `SELECT ls.set_id, ls.user_id, ls.title, ls.description, ls.is_public, ls.created_at, ls.updated_at,
              u.username AS owner_username
       FROM learning_sets ls
       INNER JOIN users u ON u.user_id = ls.user_id
       WHERE ls.is_public = 1
       ORDER BY ls.updated_at DESC`,
    )
    .all();
}

function findLearningSetById(setId) {
  return db
    .prepare(
      `SELECT set_id, user_id, title, description, is_public, created_at, updated_at
       FROM learning_sets
       WHERE set_id = ?`,
    )
    .get(setId);
}

function findLearningSetByIdAndUserId(setId, userId) {
  return db
    .prepare(
      `SELECT set_id, user_id, title, description, is_public, created_at, updated_at
       FROM learning_sets
       WHERE set_id = ? AND user_id = ?`,
    )
    .get(setId, userId);
}

function updateLearningSet({ setId, userId, title, description, isPublic }) {
  db.prepare(
    `UPDATE learning_sets
     SET title = ?, description = ?, is_public = ?, updated_at = CURRENT_TIMESTAMP
     WHERE set_id = ? AND user_id = ?`,
  ).run(title, description || null, isPublic ? 1 : 0, setId, userId);

  return findLearningSetByIdAndUserId(setId, userId);
}

function deleteLearningSet(setId, userId) {
  try {
    db.exec('BEGIN');

    db.prepare(
      `DELETE FROM user_flashcard_progress
       WHERE flashcard_id IN (SELECT flashcard_id FROM flashcards WHERE set_id = ?)`,
    ).run(setId);

    db.prepare(
      `DELETE FROM review_logs
       WHERE flashcard_id IN (SELECT flashcard_id FROM flashcards WHERE set_id = ?)`,
    ).run(setId);

    db.prepare(
      `DELETE FROM flashcards
       WHERE set_id = ?`,
    ).run(setId);

    const result = db
      .prepare(
        `DELETE FROM learning_sets
         WHERE set_id = ? AND user_id = ?`,
      )
      .run(setId, userId);

    db.exec('COMMIT');
    return result.changes;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

module.exports = {
  createLearningSet,
  listLearningSetsByUserId,
  listPublicLearningSets,
  findLearningSetById,
  findLearningSetByIdAndUserId,
  updateLearningSet,
  deleteLearningSet,
};
