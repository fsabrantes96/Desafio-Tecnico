

const sqlite3 = require('sqlite3').verbose();
const path = require('path');


const DB_PATH = path.join(__dirname, '..', '..', 'database.db'); 


const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err.message);
    throw err; 
  }
  
  console.log('Conectado ao banco de dados SQLite.');
});


db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS participations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    participation INTEGER NOT NULL
  )`, (err) => {
    if (err) {
      console.error('Erro ao criar a tabela:', err.message);
    }
  });
});


module.exports = db;