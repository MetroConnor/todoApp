const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3001;

const pool = new Pool({
    user: process.env.PGUSER || 'mustermann',
    host: process.env.PGHOST || 'database',
    database: process.env.PGDATABASE || 'todoapp',
    password: process.env.PGPASSWORD || 'mustermann',
    port: process.env.PGPORT || 5432,
});

app.use(cors());
app.use(bodyParser.json());

// Secret Key for JWT
const JWT_SECRET = 't&5*P$5QwA!R%8e@U6sY';

// Middleware for token verification
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    jwt.verify(token.split(' ')[1], JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Failed to authenticate token' });
        }
        req.userId = decoded.id; // Setze die userID aus dem Token in den Request
        req.userRole = decoded.role; // Setze die Rolle aus dem Token in den Request
        next();
    });
};

// User registration
app.post('/register', async (req, res) => {
    const { username, password, role } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const result = await pool.query(
            'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING *',
            [username, hashedPassword, role]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error during registration:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// User login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        const user = result.rows[0];

        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

        // Ausgabe des Tokens auf der Konsole zur Überprüfung
        console.log('Token:', token);

        res.json({ token });
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get todos
app.get('/todos', verifyToken, async (req, res) => {
    try {
        let result;
        if (req.userRole === 'admin') {
            result = await pool.query('SELECT * FROM todos');
        } else {
            result = await pool.query('SELECT * FROM todos WHERE user_id = $1', [req.userId]);
        }
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching todos:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Create todo
app.post('/todos', verifyToken, async (req, res) => {
    const { text } = req.body;
    const userId = req.userId;

    if (!text || !userId) {
        return res.status(400).send('Text und userId sind erforderlich');
    }

    try {
        const newTodo = await pool.query(
            'INSERT INTO todos (text, completed, user_id) VALUES ($1, $2, $3) RETURNING *',
            [text, false, userId]
        );
        res.json(newTodo.rows[0]);
    } catch (error) {
        console.error('Error creating todo:', error);
        res.status(500).json({ error: 'Error creating todo' });
    }
});

// Update todo
app.put('/todos/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { text, completed } = req.body;
    const userId = req.userId;

    try {
        const todoResult = await pool.query('SELECT * FROM todos WHERE id = $1', [id]);
        const todo = todoResult.rows[0];

        if (!todo) {
            return res.status(404).json({ error: 'Todo not found' });
        }

        if (todo.user_id !== userId && req.userRole !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const result = await pool.query(
            'UPDATE todos SET text = $1, completed = $2 WHERE id = $3 RETURNING *',
            [text, completed, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating todo:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Delete todo
app.delete('/todos/:id', verifyToken, async (req, res) => {
    const { id } = req.params;

    try {
        const todoResult = await pool.query('SELECT * FROM todos WHERE id = $1', [id]);
        const todo = todoResult.rows[0];

        if (!todo) {
            return res.status(404).json({ error: 'Todo not found' });
        }

        if (todo.user_id !== req.userId && req.userRole !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        await pool.query('DELETE FROM todos WHERE id = $1', [id]);
        res.json({ message: 'Todo deleted' });
    } catch (err) {
        console.error('Error deleting todo:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});