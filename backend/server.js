const app = require('./src/app');

const { initializeDatabase } = require('./src/config/database');

const PORT = 3001;

const startServer = () => {
    app.listen(PORT, () => {
        console.log('Servidor rodando...');
    });
};

initializeDatabase().then(startServer);