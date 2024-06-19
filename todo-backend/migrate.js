// migrate.js

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
    user: 'mustermann',
    host: 'database',
    database: 'todoapp',
    password: 'mustermann',
    port: 5432,
});

async function runMigrations() {
    try {
        const client = await pool.connect();
        // Verzeichnis mit Migrationsdateien
        const migrationsDir = path.join(__dirname, 'migrations');
        // Alle SQL-Dateien im Migrationsverzeichnis lesen
        const migrationFiles = fs.readdirSync(migrationsDir).sort();
        for (const migrationFile of migrationFiles) {
            const filePath = path.join(migrationsDir, migrationFile);
            const sql = fs.readFileSync(filePath, 'utf-8');
            console.log(`Running migration: ${migrationFile}`);
            await client.query(sql);
        }
        await client.release();
        console.log('Migrations completed successfully');
    } catch (err) {
        console.error('Migration error:', err);
    } finally {
        await pool.end();
    }
}

runMigrations();
