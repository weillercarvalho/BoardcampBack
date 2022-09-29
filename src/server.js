import express from 'express';
import pg from 'pg';
import dotenv, { config } from 'dotenv';
import cors from 'cors';

dotenv.config();

const {Pool} = pg;

const connection  = new Pool({
    connectionString: process.env.DATABASE_URL,
})

const server = express();
server.use(cors())
server.use(express.json());

server.post('/status', async (req,res) => {
    const {id, name} = req.body;
    const query = await connection.query('INSERT INTO categories (id,name) VALUES($1,$2)',[id,name])
    res.sendStatus(201);
})

server.get('/status', async (req,res) => {
    const query = await connection.query('SELECT * FROM categories');
    res.send(query)
})

server.listen(4000, () => {
    console.log(`Listening on the 4000.`)
})