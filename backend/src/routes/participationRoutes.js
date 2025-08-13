const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');


router.get('/', async (req, res) => {
    try {
        const result = await pool.query('select * from participations order by id');
        res.json({ message: 'success', data: result.rows });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Erro ao buscar dados.' });
    }
});


router.post('/', async (req, res) => {
    const { firstName, lastName, participation } = req.body;
    if (!firstName || !lastName || participation == null) {
        return res.status(400).json({ "error": "Todos os campos são obrigatórios." });
    }
    const participationNumber = parseInt(participation);
    if (isNaN(participationNumber) || participationNumber <= 0) {
        return res.status(400).json({ "error": "O campo 'Participação' deve ser um número positivo." });
    }
    const sql = 'insert into participations (firstName, lastName, participation) values ($1, $2, $3) returning *';
    const params = [firstName, lastName, participation]; 
    
    try {
        const result = await pool.query(sql, params);
        res.status(201).json({ message: 'success', data: result.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Erro ao salvar os dados.' });
    }
});


router.put('/:id', async (req, res) => { 
    const { id } = req.params;
    const { firstName, lastName, participation } = req.body;

    if (!firstName || !lastName || participation == null) {
        return res.status(400).json({ "error": "Todos os campos são obrigatórios." });
    }

    const participationNumber = parseInt(participation);
    if (isNaN(participationNumber) || participationNumber <= 0) {
        
        return res.status(400).json({ "error": "O campo 'Participação' deve ser um número positivo." });
    }

    
    const sql = `
        update participations 
        set 
            firstName = $1,
            lastName = $2,
            participation = $3
        where id = $4 returning *
    `;
    const params = [firstName, lastName, participation, id];

    try {
        const result = await pool.query(sql, params);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Participante não encontrado.' });
        }
        res.status(200).json({ message: 'success', data: result.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Erro ao atualizar dados.' });
    }
});


router.delete('/', async (req, res) => {
    const sql = 'truncate table participations restart identity';
    try {
        await pool.query(sql);
        res.status(200).json({ message: 'Todos os dados foram limpos com sucesso.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Erro ao limpar os dados.' });
    }
});

module.exports = router;