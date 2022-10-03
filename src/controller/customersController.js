import { connection } from "../database/db.js";
import { stripHtml } from "string-strip-html";

async function postCustomers(req, res) {
  const { name, phone, cpf, birthday } = req.body;
  const newname = stripHtml(name).result.trim();
  try {
    const getting = await connection.query(
      `SELECT * FROM customers WHERE cpf = $1`,
      [cpf]
    );
    if (getting.rows.length > 0) {
      return res.sendStatus(409);
    }
    const query = await connection.query(
      `INSERT INTO customers (name,phone,cpf,birthday) VALUES($1,$2,$3,$4)`,
      [newname, phone, cpf, birthday]
    );
    return res.sendStatus(201);
  } catch (error) {
    return res.status(500).send(error.message);
  }
}

async function listCustomers(req, res) {
  const { order, desc } = req.query;
  try {
    if (order === undefined) {
      const query = await connection.query(`SELECT * FROM customers;`);
      return res.send(query.rows);
    }
    if (order && desc === "true") {
      const query = await connection.query(
        "SELECT * FROM customers ORDER BY $1 DESC;",
        [order]
      );
      return res.send(query.rows);
    }
    if (order) {
      const query = await connection.query(
        "SELECT * FROM customers ORDER BY $1;",
        [order]
      );
      return res.send(query.rows);
    }
  } catch (error) {
    return res.status(500).send(error.message);
  }
}

async function updateCustomers(req, res) {
  const { id } = req.params;
  const { name, phone, cpf, birthday } = req.body;
  const newname = stripHtml(name).result.trim();
  try {
    const getting = await connection.query(
      `SELECT * FROM customers WHERE cpf = $1;`,
      [cpf]
    );
    if (getting.rows.length > 0) {
      return res.sendStatus(409);
    }
    const query = await connection.query(
      `UPDATE customers SET name = $1, phone = $2, cpf = $3, birthday = $4 WHERE id = $5;`,
      [newname, phone, cpf, birthday, id]
    );
    return res.sendStatus(200);
  } catch (error) {
    return res.status(500).send(error.message);
  }
}

export { postCustomers, listCustomers, updateCustomers };
