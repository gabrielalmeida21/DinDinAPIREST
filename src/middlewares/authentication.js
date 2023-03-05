const jwt = require("jsonwebtoken");
const pool = require("../instance");
const JWTtoken = require("../JWTtoken");

async function verifyLoggedUser(req, res, next) {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(400).json({ mensagem: "Não autorizado" });
  }

  const token = authorization.split(" ")[1];

  try {
    const { id } = jwt.verify(token, JWTtoken);
    const { rows, rowCount } = await pool.query(
      "select * from usuarios where id = $1",
      [id]
    );

    if (rowCount < 1) {
      return res.status(400).json({ mensagem: "Não autorizado" });
    }
    req.user = rows[0];

    next();
  } catch (error) {
    return res.status(400).json({ mensagem: "Não autorizado" });
  }
}

module.exports = verifyLoggedUser;
