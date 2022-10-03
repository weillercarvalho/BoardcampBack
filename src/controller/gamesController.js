import { connection } from "../database/db.js";
import { stripHtml } from "string-strip-html";

async function postGames(req, res) {
  const { name, image, stockTotal, categoryId, pricePerDay } = req.body;
  const newname = stripHtml(name).result.trim();
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
}

const capitalize = (s) => s && s[0].toUpperCase() + s.slice(1).toLowerCase();

async function listGames(req, res) {
  const { name, order, desc } = req.query;
  try {
    if (name !== undefined) {
      const querys = await connection.query(
        `SELECT games.*, categories.name AS "categoryName" FROM games JOIN categories ON games."categoryId" = categories.id WHERE games.name LIKE ($1 || '%');
        `,
        [capitalize(name)]
      );
      return res.send(querys.rows);
    }
    if (name === undefined && order === undefined) {
      const query =
        await connection.query(`SELECT games.*, categories.name AS "categoryName" FROM games JOIN categories ON games."categoryId" = categories.id;
    `);
      return res.send(query.rows);
    }
    if (order && desc === "true") {
      const query = await connection.query(
        "SELECT * FROM games ORDER BY $1 DESC;",
        [order]
      );
      return res.send(query.rows);
    }
    if (order) {
      const query = await connection.query("SELECT * FROM games ORDER BY $1;", [
        order,
      ]);
      return res.send(query.rows);
    }
  } catch (error) {
    return res.status(500).send(error.message);
  }
}

export { listGames, postGames };
