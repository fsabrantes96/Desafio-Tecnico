const express = require('express');
const cors = require('cors');
const path = require('path');

const participationRoutes = require('./routes/participationRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', '..', 'frontend')));

app.use('/api/participations', participationRoutes);

module.exports = app;