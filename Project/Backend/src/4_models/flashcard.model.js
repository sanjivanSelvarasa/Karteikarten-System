const { db } = require('./db');

function createFlashcard({ setId, question, answer, position }) {
  const result = db
    .prepare(
      `INSERT INTO flashcards (set_id, question, answer, position)
       VALUES (?, ?, ?, ?)`,
    )
    .run(setId, question, answer, position);

  return findFlashcardById(result.lastInsertRowid);
}

function listFlashcardsBySetId(setId) {
  return db
    .prepare(
      `SELECT flashcard_id, set_id, question, answer, position, created_at, updated_at
       FROM flashcards
       WHERE set_id = ?
       ORDER BY position ASC, flashcard_id ASC`,
    )
    .all(setId);
}

function findFlashcardById(flashcardId) {
  return db
    .prepare(
      `SELECT flashcard_id, set_id, question, answer, position, created_at, updated_at
       FROM flashcards
       WHERE flashcard_id = ?`,
    )
    .get(flashcardId);
}

function findFlashcardWithOwner(flashcardId) {
  return db
    .prepare(
      `SELECT f.flashcard_id, f.set_id, f.question, f.answer, f.position,
              ls.user_id
       FROM flashcards f
       INNER JOIN learning_sets ls ON ls.set_id = f.set_id
       WHERE f.flashcard_id = ?`,
    )
    .get(flashcardId);
}

function updateFlashcard({ flashcardId, question, answer, position }) {
  db.prepare(
    `UPDATE flashcards
     SET question = ?, answer = ?, position = ?, updated_at = CURRENT_TIMESTAMP
     WHERE flashcard_id = ?`,
  ).run(question, answer, position, flashcardId);

  return findFlashcardById(flashcardId);
}

function deleteFlashcard(flashcardId) {
  return db
    .prepare(
      `DELETE FROM flashcards
       WHERE flashcard_id = ?`,
    )
    .run(flashcardId).changes;
}

module.exports = {
  createFlashcard,
  listFlashcardsBySetId,
  findFlashcardById,
  findFlashcardWithOwner,
  updateFlashcard,
  deleteFlashcard,
};
