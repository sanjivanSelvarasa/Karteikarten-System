const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const dbPath = path.resolve(__dirname, '..', '..', process.env.DB_PATH || '../DB/karteikarten.db');
const schemaPath = path.resolve(__dirname, '..', '..', '..', 'DB', 'create.sql');

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new DatabaseSync(dbPath);
db.exec('PRAGMA foreign_keys = ON');

function initializeDatabase() {
  const usersTable = db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'users'")
    .get();

  if (!usersTable) {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schema);
  }
}

module.exports = {
  db,
  initializeDatabase,
};
