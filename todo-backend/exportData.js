const fs = require('fs');
const { Pool } = require('pg');

const pool = new Pool({
    user: 'mustermann',
    host: 'database',
    database: 'todoapp',
    password: 'mustermann',
    port: 5432,
});

const exportData = async () => {
    try {
        console.log('Verbindung zur Datenbank herstellen...');

        const users = await pool.query('SELECT * FROM users');
        const todos = await pool.query('SELECT * FROM todos');

        const data = {
            users: users.rows,
            todos: todos.rows
        };

        fs.writeFileSync('seedData.json', JSON.stringify(data, null, 2));
        console.log('Daten erfolgreich exportiert.');
    } catch (err) {
        console.error('Fehler beim Export der Daten:', err);
    } finally {
        await pool.end();
    }
};

exportData();