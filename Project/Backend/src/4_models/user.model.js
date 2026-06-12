const { db } = require('./db');

function findUserByEmail(email) {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
}

function findUserByUsername(username) {
  return db
    .prepare('SELECT * FROM users WHERE LOWER(username) = LOWER(?)')
    .get(username);
}

function findUserById(userId) {
  return db
    .prepare(
      `SELECT user_id, username, email, created_at, updated_at
       FROM users
       WHERE user_id = ?`,
    )
    .get(userId);
}

function createUser({ username, email, passwordHash }) {
  const statement = db.prepare(
    `INSERT INTO users (username, email, password_hash)
     VALUES (?, ?, ?)`,
  );

  const result = statement.run(username, email, passwordHash);
  return findUserById(result.lastInsertRowid);
}

module.exports = {
  findUserByEmail,
  findUserByUsername,
  findUserById,
  createUser,
};
