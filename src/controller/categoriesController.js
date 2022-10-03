import { connection } from "../database/db.js";
import { stripHtml } from "string-strip-html";

async function postCategories(req, res) {
  const { name } = req.body;
  const newname = stripHtml(name).result.trim();
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
}

async function listCategories(req, res) {
  const { order, desc } = req.query;

  try {
    if (order === undefined) {
      const query = await connection.query("SELECT * FROM categories;");
      return res.send(query.rows);
    }
    if (order && desc === "true") {
      const query = await connection.query(
        "SELECT * FROM categories ORDER BY $1 DESC;",
        [order]
      );
      return res.send(query.rows);
    }
    if (order) {
      const query = await connection.query(
        "SELECT * FROM categories ORDER BY $1;",
        [order]
      );
      return res.send(query.rows);
    } else {
      return res.status(422).send({ message: `Query String invalida.` });
    }
  } catch (error) {
    return res.status(500).send(error.message);
  }
}

export { listCategories, postCategories };
