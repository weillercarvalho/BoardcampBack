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
  const {order, desc} = req.query;
  console.log(order,desc)

  try {
    if(order === undefined) {
      const query = await connection.query("SELECT * FROM categories;");
      return res.send(query.rows);
    }
    if (order === 'name') {
      const query = await connection.query("SELECT * FROM categories ORDER BY $1;",[order]);
      return res.send(query.rows);
    }
    if (order === 'id') {
      const query = await connection.query("SELECT * FROM categories ORDER BY $1;",[order]);
      return res.send(query.rows);
    }
    if (order === 'name' && desc === 'true') {
      const query = await connection.query("SELECT * FROM categories ORDER BY $1 DESC;",[order]);
      return res.send(query.rows);
    }
    if (order === 'id' && desc === 'true') {
      const query = await connection.query("SELECT * FROM categories ORDER BY $1 DESC;",[order]);
      return res.send(query.rows);
    }
    else {
      return res.status(422).send({message: `Query String invalida.`})
    }
  } catch (error) {
    return res.status(500).send(error.message)
  }
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

const capitalize = s => s && s[0].toUpperCase() + s.slice(1).toLowerCase();

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
  date.setHours(0,0,0,0);
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
  const {customerId} = req.query;
  const {gameId} = req.query;
  try {
    if (customerId) {
      const query = await connection.query(`SELECT rentals.*, json_build_object('id', customers.id, 'name', customers.name) AS customer, json_build_object('id', games.id, 'name', games.name, 'categoryId', games."categoryId", 'categoryName', categories.name) AS game FROM rentals JOIN customers ON rentals."customerId" = customers.id JOIN games ON rentals."gameId" = games.id JOIN categories ON games."categoryId" = categories.id WHERE customers.id = $1;`,[customerId]);
      return res.send(query.rows);
    }
    if (gameId) {
      const query = await connection.query(`SELECT rentals.*, json_build_object('id', customers.id, 'name', customers.name) AS customer, json_build_object('id', games.id, 'name', games.name, 'categoryId', games."categoryId", 'categoryName', categories.name) AS game FROM rentals JOIN customers ON rentals."customerId" = customers.id JOIN games ON rentals."gameId" = games.id JOIN categories ON games."categoryId" = categories.id WHERE games.id = $1;`,[gameId]);
      return res.send(query.rows);
    }
    else {
      const query = await connection.query(`SELECT rentals.*, json_build_object('id', customers.id, 'name', customers.name) AS customer, json_build_object('id', games.id, 'name', games.name, 'categoryId', games."categoryId", 'categoryName', categories.name) AS game FROM rentals JOIN customers ON rentals."customerId" = customers.id JOIN games ON rentals."gameId" = games.id JOIN categories ON games."categoryId" = categories.id;`);
      query.rows.forEach(value => {
        value.rentDate = value.rentDate.toISOString().split('T')[0];
        if (value.returnDate !== null) {
          value.returnDate = value.returnDate.toISOString().split('T')[0];
        }
      })
      return res.send(query.rows)
    }

  } catch (error) {
    return res.status(500).send(error.message);
  }
})

server.post("/rentals/:id/return", async (req,res) => {
  const {id} = req.params;
  const date = new Date();
  date.setHours(0,0,0,0);
  const gettingId = await connection.query(`SELECT * FROM rentals WHERE id = $1;`,[id]);
  if (gettingId.rows.length === 0) {
    return res.sendStatus(404);
  }
  const gettingDateFee = (await connection.query(`SELECT rentals."delayFee" FROM rentals WHERE id = $1;`,[id])).rows[0];
  if (gettingDateFee.delayFee !== null) {
    return res.sendStatus(400);
  }
  const gettingDateRent = (await connection.query(`SELECT rentals."rentDate" FROM rentals WHERE id = $1;`,[id])).rows[0];
  const gettingDaysRented = (await connection.query(`SELECT rentals."daysRented" FROM rentals WHERE id = $1;`, [id])).rows[0];
  const gettingOriginalPrice = (await connection.query(`SELECT rentals."originalPrice" FROM rentals WHERE id = $1;`, [id])).rows[0];
  const differenceDays = ((date - gettingDateRent.rentDate) / (60 * 60 * 24 * 1000));
  let finalFee = 0;
  if (differenceDays > gettingDaysRented.daysRented) {
    finalFee = (gettingOriginalPrice.originalPrice / gettingDaysRented.daysRented) * (differenceDays - gettingDaysRented.daysRented);
  }
  try {
    const query = await connection.query(`UPDATE rentals SET "returnDate" = $1, "delayFee" = $2 WHERE id = $3;`,[date, finalFee, id]);
    return res.sendStatus(200);
  } catch (error) {
    return res.status(500).send(error.message);
  }
})

server.delete("/rentals/:id", async (req,res) => {
  const {id} = req.params;
  const gettingId = (await connection.query(`SELECT * FROM rentals WHERE id = $1;`,[id])).rows;

  if (gettingId.length === 0) {
    return res.sendStatus(404)
  }
  const gettingDate = (await connection.query(`SELECT rentals."returnDate" FROM rentals WHERE id = $1;`, [id])).rows[0];
  if (gettingDate.returnDate === null) {
    return res.sendStatus(400);
  }
  try {
    const query = (await connection.query(`DELETE FROM rentals WHERE id = $1`, [id]));
    return res.sendStatus(200)
  } catch (error) {
    return res.status(500).send(error.message);
  }
})

server.listen(4000, () => {
  console.log(`Listening on the 4000.`);
});
