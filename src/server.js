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

const putCustomersSchema = joi.object({
  name: joi.string().empty(" ").min(1).max(50).required(),
  phone: joi.string().min(10).max(11).required(),
  cpf: joi.string().length(11).pattern(/^[0-9]+$/).required(),
  birthday: joi.date().iso()
})


const postRentalsSchema = joi.object({
  customerId: joi.number().required(),
  gameId: joi.number().required(),
  daysRented: joi.number().greater(0).required() 
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

server.put("/customers/:id", async (req,res) => {
  const {id} = req.params;
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
  const validation = putCustomersSchema.validate(req.body, {abortEarly:false});
  if (validation.error) {
    return res.sendStatus(400)
  }
  try {
    const getting = await connection.query(`SELECT * FROM customers WHERE cpf = $1;`,[cpf]);
    if (getting.rows.length > 0) {
      return res.sendStatus(409)
    }
    const query = await connection.query(`UPDATE customers SET name = $1, phone = $2, cpf = $3, birthday = $4 WHERE id = $5;`,[newname, phone, cpf, birthday, id]);
    return res.sendStatus(200)
  } catch (error) {
    return res.status(500).send(error.message);
  }
})

server.post("/rentals", async (req,res) => {
  const date = new Date();
  const {customerId, gameId, daysRented} = req.body;
  const validation = postRentalsSchema.validate(req.body,{abortEarly:false});
  if (validation.error) {
    return res.sendStatus(400);
  }
  const gettingGameId = await connection.query(`SELECT * FROM games WHERE id = $1;`,[gameId]);
  if (gettingGameId.rows.length === 0) {
    return res.sendStatus(400);
  }
  const gettingCustomerId = await connection.query(`SELECT * FROM customers WHERE Id = $1;`,[customerId]);
  if (gettingCustomerId.rows.length === 0) {
    return res.sendStatus(400);
  }
  const gettingGamesAll = await connection.query(`SELECT * FROM games;`);
  const gettingRentalsAll = await connection.query(`SELECT * FROM rentals;`)
  if (gettingGamesAll.rows.length < gettingRentalsAll.rows.length) {
    return res.sendStatus(400);
  }
  try {
    const gettingGame = (await connection.query(`SELECT games."pricePerDay" FROM games;`)).rows[0];
    const query = await connection.query(`INSERT INTO rentals ("customerId", "gameId", "rentDate", "daysRented", "returnDate", "originalPrice", "delayFee") VALUES ($1, $2, $3, $4, $5, $6, $7);`, [customerId, gameId, date, daysRented, null, gettingGame.pricePerDay * daysRented, null]);
    return res.sendStatus(201)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

server.get("/rentals", async (req,res) => {
  // CONTINUAR DAQUI
  try {
    const query = await connection.query(`SELECT * FROM rentals;`);
    return res.send(query.rows);
  } catch (error) {
    return res.status(500).send(error.message);
  }
})

server.listen(4000, () => {
  console.log(`Listening on the 4000.`);
});
