require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const initializeDatabase = async () => {
  const createTableQuery = `
    create table if not exists participations (
      id serial primary key,
      firstName text not null,
      lastName text not null,
      participation integer not null
    );
  `;

  try {
    await pool.query(createTableQuery);
    console.log('Banco de dados conectado e tabela "participations" pronta.');
  } catch (err) {
    console.error('Erro ao inicializar o banco de dados:', err.stack);
    process.exit(1);
  }
};

module.exports = {
  pool,
  initializeDatabase
};