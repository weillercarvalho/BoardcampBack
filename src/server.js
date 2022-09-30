import express from 'express';
import pg from 'pg';
import dotenv from 'dotenv';
import cors from 'cors';
import joi from 'joi';
import {stripHtml} from 'string-strip-html';

dotenv.config();

const {Pool} = pg;

const connection  = new Pool({
    connectionString: process.env.DATABASE_URL,
})

const server = express();
server.use(cors())
server.use(express.json());

const postCategoriesSchema = joi.object({
    name: joi.string().empty(" ").min(1).max(50).required()
})

const postGamesSchema = joi.object({
    name: joi.string().empty(" ").min(1).max(50).required(),
    image: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'br'] } }).empty(" ").min(1).max(5000).required(),
    stockTotal: joi.number().required(),
    categoryId: joi.number().required(),
    pricePerDay: joi.number().required()
})

server.post('/categories', async (req,res) => {
    const {name} = req.body;
    const newname = stripHtml(name).result.trim();
    const validation = postCategoriesSchema.validate(req.body);
    if (validation.error) {
        return res.status(400);
    }
    try {
        const getting = (await connection.query('SELECT * FROM categories WHERE name = $1',[newname]));
        if(getting.rows.length > 0) {
            return res.sendStatus(409);
        }
        const query = await connection.query('INSERT INTO categories (name) VALUES($1);',[newname]);
        return res.sendStatus(201);
    } catch (error) {
        return res.status(500).send(error.message);
    }
})

server.get('/categories', async (req,res) => {
    const query = await connection.query('SELECT * FROM categories;');
    res.send(query.rows)
})

server.listen(4000, () => {
    console.log(`Listening on the 4000.`)
})