import { connection } from "../database/db.js";

async function postRentals(req, res) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  const { customerId, gameId, daysRented } = req.body;

  const gettingGameId = await connection.query(
    `SELECT * FROM games WHERE id = $1;`,
    [gameId]
  );
  if (gettingGameId.rows.length === 0) {
    return res.sendStatus(400);
  }
  const gettingCustomerId = await connection.query(
    `SELECT * FROM customers WHERE Id = $1;`,
    [customerId]
  );
  if (gettingCustomerId.rows.length === 0) {
    return res.sendStatus(400);
  }
  const gettingGamesAll = await connection.query(`SELECT * FROM games;`);
  const gettingRentalsAll = await connection.query(`SELECT * FROM rentals;`);
  if (gettingGamesAll.rows.length < gettingRentalsAll.rows.length) {
    return res.sendStatus(400);
  }
  try {
    const gettingGame = (
      await connection.query(`SELECT games."pricePerDay" FROM games;`)
    ).rows[0];
    const query = await connection.query(
      `INSERT INTO rentals ("customerId", "gameId", "rentDate", "daysRented", "returnDate", "originalPrice", "delayFee") VALUES ($1, $2, $3, $4, $5, $6, $7);`,
      [
        customerId,
        gameId,
        date,
        daysRented,
        null,
        gettingGame.pricePerDay * daysRented,
        null,
      ]
    );
    return res.sendStatus(201);
  } catch (error) {
    res.status(500).send(error.message);
  }
}

async function listRentals(req, res) {
  const { customerId, gameId, order, desc, status } = req.query;
  let query;
  try {
    if (status === "open") {
      query = await connection.query(
        `SELECT rentals.*, json_build_object('id', customers.id, 'name', customers.name) AS customer, json_build_object('id', games.id, 'name', games.name, 'categoryId', games."categoryId", 'categoryName', categories.name) AS game FROM rentals JOIN customers ON rentals."customerId" = customers.id JOIN games ON rentals."gameId" = games.id JOIN categories ON games."categoryId" = categories.id;`
      );
      const queryClean = query.rows.filter((value) => {
        if (value.returnDate === null) {
          return value;
        }
      });
      return res.send(queryClean);
    }
    if (status === "closed") {
      query = await connection.query(
        `SELECT rentals.*, json_build_object('id', customers.id, 'name', customers.name) AS customer, json_build_object('id', games.id, 'name', games.name, 'categoryId', games."categoryId", 'categoryName', categories.name) AS game FROM rentals JOIN customers ON rentals."customerId" = customers.id JOIN games ON rentals."gameId" = games.id JOIN categories ON games."categoryId" = categories.id;`
      );
      const queryClean = query.rows.filter((value) => {
        if (value.returnDate !== null) {
          return value;
        }
      });
      return res.send(queryClean);
    }
    if (customerId) {
      query = await connection.query(
        `SELECT rentals.*, json_build_object('id', customers.id, 'name', customers.name) AS customer, json_build_object('id', games.id, 'name', games.name, 'categoryId', games."categoryId", 'categoryName', categories.name) AS game FROM rentals JOIN customers ON rentals."customerId" = customers.id JOIN games ON rentals."gameId" = games.id JOIN categories ON games."categoryId" = categories.id WHERE customers.id = $1;`,
        [customerId]
      );
      return res.send(query.rows);
    }
    if (gameId) {
      query = await connection.query(
        `SELECT rentals.*, json_build_object('id', customers.id, 'name', customers.name) AS customer, json_build_object('id', games.id, 'name', games.name, 'categoryId', games."categoryId", 'categoryName', categories.name) AS game FROM rentals JOIN customers ON rentals."customerId" = customers.id JOIN games ON rentals."gameId" = games.id JOIN categories ON games."categoryId" = categories.id WHERE games.id = $1;`,
        [gameId]
      );
      return res.send(query.rows);
    }
    if (order && desc === "true") {
      query = await connection.query(
        `SELECT rentals.*, json_build_object('id', customers.id, 'name', customers.name) AS customer, json_build_object('id', games.id, 'name', games.name, 'categoryId', games."categoryId", 'categoryName', categories.name) AS game FROM rentals JOIN customers ON rentals."customerId" = customers.id JOIN games ON rentals."gameId" = games.id JOIN categories ON games."categoryId" = categories.id ORDER BY $1 DESC;`,
        [order]
      );
    }
    if (order) {
      query = await connection.query(
        `SELECT rentals.*, json_build_object('id', customers.id, 'name', customers.name) AS customer, json_build_object('id', games.id, 'name', games.name, 'categoryId', games."categoryId", 'categoryName', categories.name) AS game FROM rentals JOIN customers ON rentals."customerId" = customers.id JOIN games ON rentals."gameId" = games.id JOIN categories ON games."categoryId" = categories.id ORDER BY $1;`,
        [order]
      );
    } else {
      query = await connection.query(
        `SELECT rentals.*, json_build_object('id', customers.id, 'name', customers.name) AS customer, json_build_object('id', games.id, 'name', games.name, 'categoryId', games."categoryId", 'categoryName', categories.name) AS game FROM rentals JOIN customers ON rentals."customerId" = customers.id JOIN games ON rentals."gameId" = games.id JOIN categories ON games."categoryId" = categories.id;`
      );
    }
    query.rows.forEach((value) => {
      value.rentDate = value.rentDate.toISOString().split("T")[0];
      if (value.returnDate !== null) {
        value.returnDate = value.returnDate.toISOString().split("T")[0];
      }
    });
    return res.send(query.rows);
  } catch (error) {
    return res.status(500).send(error.message);
  }
}

async function closeRentals(req, res) {
  const { id } = req.params;
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  const gettingId = await connection.query(
    `SELECT * FROM rentals WHERE id = $1;`,
    [id]
  );
  if (gettingId.rows.length === 0) {
    return res.sendStatus(404);
  }
  const gettingDateFee = (
    await connection.query(
      `SELECT rentals."delayFee" FROM rentals WHERE id = $1;`,
      [id]
    )
  ).rows[0];
  if (gettingDateFee.delayFee !== null) {
    return res.sendStatus(400);
  }
  const gettingDateRent = (
    await connection.query(
      `SELECT rentals."rentDate" FROM rentals WHERE id = $1;`,
      [id]
    )
  ).rows[0];
  const gettingDaysRented = (
    await connection.query(
      `SELECT rentals."daysRented" FROM rentals WHERE id = $1;`,
      [id]
    )
  ).rows[0];
  const gettingOriginalPrice = (
    await connection.query(
      `SELECT rentals."originalPrice" FROM rentals WHERE id = $1;`,
      [id]
    )
  ).rows[0];
  const differenceDays =
    (date - gettingDateRent.rentDate) / (60 * 60 * 24 * 1000);
  let finalFee = 0;
  if (differenceDays > gettingDaysRented.daysRented) {
    finalFee =
      (gettingOriginalPrice.originalPrice / gettingDaysRented.daysRented) *
      (differenceDays - gettingDaysRented.daysRented);
  }
  try {
    const query = await connection.query(
      `UPDATE rentals SET "returnDate" = $1, "delayFee" = $2 WHERE id = $3;`,
      [date, finalFee, id]
    );
    return res.sendStatus(200);
  } catch (error) {
    return res.status(500).send(error.message);
  }
}

async function deleteRentals(req, res) {
  const { id } = req.params;
  const gettingId = (
    await connection.query(`SELECT * FROM rentals WHERE id = $1;`, [id])
  ).rows;

  if (gettingId.length === 0) {
    return res.sendStatus(404);
  }
  const gettingDate = (
    await connection.query(
      `SELECT rentals."returnDate" FROM rentals WHERE id = $1;`,
      [id]
    )
  ).rows[0];
  if (gettingDate.returnDate === null) {
    return res.sendStatus(400);
  }
  try {
    const query = await connection.query(`DELETE FROM rentals WHERE id = $1`, [
      id,
    ]);
    return res.sendStatus(200);
  } catch (error) {
    return res.status(500).send(error.message);
  }
}

export { postRentals, listRentals, closeRentals, deleteRentals };
