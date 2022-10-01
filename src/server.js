import express from "express";
import pg from "pg";
import dotenv from "dotenv";
import cors from "cors";
import joi from "joi";
import { stripHtml } from "string-strip-html";


dotenv.config();

const { Pool } = pg;

const connection = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const server = express();
server.use(cors());
server.use(express.json());

const postCategoriesSchema = joi.object({
  name: joi.string().empty(" ").min(1).max(50).required(),
});

const postGamesSchema = joi.object({
  name: joi.string().empty(" ").min(1).max(50).required(),
  image: joi.string().empty(" ").min(1).max(5000).required(),
  stockTotal: joi.number().greater(0).required(),
  categoryId: joi.number().required(),
  pricePerDay: joi.number().greater(0).required(),
});



const postCustomersSchema = joi.object({
  name: joi.string().empty(" ").min(1).max(50).required(),
  phone: joi.string().min(10).max(11).required(),
  cpf: joi.string().length(11).pattern(/^[0-9]+$/).required(),
  birthday: joi.date().iso()
})

server.post("/categories", async (req, res) => {
  const { name } = req.body;
  const newname = stripHtml(name).result.trim();
  const validation = postCategoriesSchema.validate(req.body, {
    abortEarly: false,
  });
  if (validation.error) {
    return res.status(400);
  }
  try {
    const getting = await connection.query(
      "SELECT * FROM categories WHERE name = $1;",
      [newname]
    );
    if (getting.rows.length > 0) {
      return res.sendStatus(409);
    }
    const query = await connection.query(
      "INSERT INTO categories (name) VALUES($1);",
      [newname]
    );
    return res.sendStatus(201);
  } catch (error) {
    return res.status(500).send(error.message);
  }
});

server.get("/categories", async (req, res) => {
  const query = await connection.query("SELECT * FROM categories;");
  res.send(query.rows);
});

server.post("/games", async (req, res) => {
  const { name, image, stockTotal, categoryId, pricePerDay } = req.body;
  const newname = stripHtml(name).result.trim();
  const validation = postGamesSchema.validate(req.body, { abortEarly: false });
  if (validation.error) {
    return res.sendStatus(400);
  }
  try {
    const gettingId = await connection.query(
      "SELECT * FROM categories WHERE id = $1;",
      [categoryId]
    );
    if (gettingId.rows.length === 0) {
      return res.sendStatus(400);
    }
    const gettingName = await connection.query(
      "SELECT * FROM games WHERE name = $1;",
      [newname]
    );
    if (gettingName.rows.length > 0) {
      return res.sendStatus(409);
    }
    const query = connection.query(
      `INSERT INTO games (name,image,"stockTotal","categoryId","pricePerDay") VALUES ($1,$2,$3,$4,$5);`,
      [name, image, stockTotal, categoryId, pricePerDay]
    );
    res.sendStatus(201);
  } catch (error) {
    return res.status(500).send(error.message);
  }
});

const capitalize = s => s && s[0].toUpperCase() + s.slice(1);

server.get("/games", async (req, res) => {
    const {name} = req.query;
  try {
    if (name) {
        const querys = await connection.query(`SELECT games.*, categories.name AS "categoryName" FROM games JOIN categories ON games."categoryId" = categories.id WHERE games.name LIKE ($1 || '%');
        `, [capitalize(name)]);
        return res.send(querys.rows);
    }
      const query =
    await connection.query(`SELECT games.*, categories.name AS "categoryName" FROM games JOIN categories ON games."categoryId" = categories.id;
    `);
    return res.send(query.rows);
  } catch (error) {
    return res.status(500).send(error.message)
  }
});

server.post("/customers", async (req,res) => {
  const {name, phone, cpf, birthday} = req.body;
  const newname = stripHtml(name).result.trim();
  const cpfNumber = parseInt(cpf,10);
  const phoneNumber = parseInt(phone,10);
  if (isNaN(cpfNumber) === true) {
    return res.sendStatus(400)
  }
  else if ((isNaN(phoneNumber) === true)) {
    return res.sendStatus(400)
  }
  const validation = postCustomersSchema.validate(req.body, {abortEarly:false});
  if (validation.error) {
    return res.sendStatus(400)
  }
  try {
    const getting = await connection.query(`SELECT * FROM customers WHERE cpf = $1`,[cpf]);
    if (getting.rows.length > 0) {
      return res.sendStatus(409)
    }
    const query = await connection.query(`INSERT INTO customers (name,phone,cpf,birthday) VALUES($1,$2,$3,$4)`,[newname, phone, cpf, birthday]);
    return res.sendStatus(201)
  } catch (error) {
    return res.status(500).send(error.message);
  }
})

server.get("/customers", async (req,res) => {
  try {
    const query = await connection.query(`SELECT * FROM customers;`);
    return res.send(query.rows);
  } catch (error) {
    return res.status(500).send(error.message);
  }
})



server.put("/customers", async (req,res) => {
  // CONTINUO AMANHA DAQUI
})



server.listen(4000, () => {
  console.log(`Listening on the 4000.`);
});
