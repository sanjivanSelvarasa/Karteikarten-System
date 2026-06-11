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
  const tx = db.transaction(() => {
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

    return result.changes;
  });

  return tx();
}

module.exports = {
  createLearningSet,
  listLearningSetsByUserId,
  findLearningSetByIdAndUserId,
  updateLearningSet,
  deleteLearningSet,
};
