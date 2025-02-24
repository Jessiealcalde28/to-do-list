import pkg from 'pg';
const { Client } =pkg;

export const db = new Client({
    host: "localhost",
    database: "to_do_list",
    user: "postgres",
    password: "laboratoryadmin123",
    port: 5432,
});

db.connect()
.then(() => console.log('Connected to PostgreSQL'))
.catch(err => console.error('connection error', err.stack));
