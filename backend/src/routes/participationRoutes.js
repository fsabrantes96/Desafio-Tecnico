const express = require('express');
const router = express.Router();
const db = require('../config/database');


router.get('/', (req, res) => {
    const sql = 'select * from participations order by id';
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ "error": err.message });
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});


router.post('/', (req, res) => {
    const { firstName, lastName, participation } = req.body;
    if (!firstName || !lastName || participation == null) {
        return res.status(400).json({ "error": "Todos os campos são obrigatórios." });
    }
    const participationNumber = parseInt(participation);
    if (isNaN(participationNumber) || participationNumber <= 0) {
        return res.status(400).json({ "error": "O campo 'Participação' deve ser um número positivo." });
    }
    const sql = 'insert into participations (firstName, lastName, participation) values (?, ?, ?)';
    const params = [firstName, lastName, participationNumber]; 
    db.run(sql, params, function(err) {
        if (err) {
            return res.status(500).json({ "error": err.message });
        }
        
        res.status(201).json({
            "message": "success",
            "data": { id: this.lastID, firstName, lastName, participation: participationNumber }
        });
    });
});


router.put('/:id', (req, res) => { 
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
        UPDATE participations 
        SET 
            firstName = ?,
            lastName = ?,
            participation = ?
        WHERE id = ?
    `;
    const params = [firstName, lastName, participationNumber, id];

    db.run(sql, params, function(err) {
        if (err) {
            return res.status(500).json({ "error": err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ "error": "Participante não encontrado." });
        }
        res.status(200).json({
            "message": "success",
            "data": { id: id, firstName, lastName, participation: participationNumber },
            "changes": this.changes
        });
    });
});


router.delete('/', (req, res) => {
    db.serialize(() => {
        const deleteDataSql = 'delete from participations';
        db.run(deleteDataSql, function(err) {
            if (err) {
                return res.status(500).json({ "error": `Erro ao limpar os dados: ${err.message}` });
            }
            const resetSequenceSql = `delete from sqlite_sequence where name='participations'`;
            db.run(resetSequenceSql, function(err) {
                if (err) {
                    console.error("Não foi possivel resetar a sequencia de IDs, mas os dados foram limpos.", err.message);
                }
                res.status(200).json({ "message": "Todos os dados foram limpos com sucesso e o contador de IDs foi resetado." });
            });
        });
    });
});

module.exports = router;