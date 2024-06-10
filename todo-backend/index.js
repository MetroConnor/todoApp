//Web-Framework für Node.js
const express = require('express');
//parst Anfragen in JSON-Format
const bodyParser = require('body-parser');
//Node.js Client für PostgreSQL
const { Pool } = require('pg');
//cross Resource sharing
const cors = require('cors');

const app = express();
const port = 3001;

//Ermöglicht Zugriff auf die API vom anderen Port
app.use(cors());
app.use(bodyParser.json());

const pool = new Pool({
    user: 'mustermann',
    host: 'localhost',
    database: 'todoapp',
    password: 'mustermann',
    port: 5432,
});


//Zieht alle Todos aus der Datenbank und sendet sie als JSON zurück
app.get('/todos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM todos');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//Erstellt ein neues to-do und fügt es in die Datenbank ein
app.post('/todos', async (req, res) => {
    const { text } = req.body;
    try {
        const result = await pool.query('INSERT INTO todos (text) VALUES ($1) RETURNING *', [text]);
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//aktualisiert to-dos anhand der id
app.put('/todos/:id', async (req, res) => {
    const { id } = req.params;
    const { text, completed } = req.body; // Nehmen Sie den neuen Status der Checkbox entgegen
    try {
        const result = await pool.query('UPDATE todos SET text = $1, completed = $2 WHERE id = $3 RETURNING *', [text, completed, id]);
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//löscht todos
app.delete('/todos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM todos WHERE id = $1', [id]);
        res.json({ message: 'Todo deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//Startet Server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
