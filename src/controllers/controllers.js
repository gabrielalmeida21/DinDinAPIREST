const pool = require("../instance");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { somaValoresFiltrados } = require("../utils/utils");

async function registerUser(req, res) {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res
      .status(400)
      .json({ mensagem: "Todos os campos devem estar preenchidos" });
  } else {
    try {
      const encryptedPassword = await bcrypt.hash(senha, 10);

      const newUser = await pool.query(
        "insert into usuarios (nome, email, senha) VALUES ($1, $2, $3) returning *",
        [nome, email, encryptedPassword]
      );

      const { senha: _, ...registeredUser } = newUser.rows[0];

      return res.status(200).json({ user: registeredUser });
    } catch (error) {
      return res
        .status(500)
        .json({ mensagem: `Erro interno do servidor: ${error.message}` });
    }
  }
}

async function login(req, res) {
  const { email, senha } = req.body;

  try {
    const user = await pool.query("select * from usuarios where email = $1", [
      email,
    ]);

    if (user.rowCount < 1) {
      return res.status(400).json({ mensagem: "Usuário ou senha inválida" });
    }

    const validPassword = await bcrypt.compare(senha, user.rows[0].senha);

    if (!validPassword) {
      return res.status(400).json({ mensagem: "Usuário ou senha inválida" });
    }

    const token = jwt.sign({ id: user.rows[0].id }, "safePassword", {
      expiresIn: "3d",
    });

    const { senha: _, ...loggedUser } = user.rows[0];

    return res.status(200).json({ user: loggedUser, token });
  } catch (error) {
    return res
      .status(500)
      .json({ mensagem: `Erro interno do servidor: ${error.message}` });
  }
}

async function userDetail(req, res) {
  return res.json(req.user);
}

async function updateUser(req, res) {
  const user = req.user;
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res
      .status(400)
      .json({ mensagem: "Todos os campos devem ser preenchidos" });
  }

  try {
    if (user.rowCount > 0 && foundUser.rows[0].id !== user.id) {
      return res.status(400).json({ mensagem: "O e-mail já está em uso" });
    }
    const encryptedPassword = await bcrypt.hash(senha, 10);
    const updateQuery =
      "update usuarios set nome = $1, email = $2, senha = $3 where id = $4";
    const updateParam = [nome, email, encryptedPassword, user.id];
    const updatedUser = await pool.query(updateQuery, updateParam);

    if (updatedUser.rowCount <= 0) {
      return res
        .status(500)
        .json({ mensagem: `Erro interno do servidor: ${error.message}` });
    }

    return res.status(204).send();
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .json({ mensagem: `Erro interno do servidor: ${error.message}` });
  }
}

async function categoryList(req, res) {
  try {
    const categories = await pool.query("select * from categorias");

    return res.status(200).json(categories.rows);
  } catch (error) {
    return res
      .status(500)
      .json({ mensagem: `Erro interno do servidor: ${error.message}` });
  }
}

async function transactionsList(req, res) {
  const { id: usuario_id } = req.user;
  const { filtro: categorias } = req.query;

  try {
    let query = `SELECT t.id, t.tipo, t.descricao, CAST(t.valor AS FLOAT), t.data AS data, t.usuario_id, t.categoria_id, c.descricao AS categoria_nome
                 FROM transacoes t
                 LEFT JOIN categorias c ON c.id = t.categoria_id
                 WHERE t.usuario_id = $1`;

    const values = [usuario_id];

    if (categorias) {
      let filtroCategorias = [];
      for (const categoria of categorias) {
        filtroCategorias.push(categoria);
      }
      const placeholders = filtroCategorias
        .map((_, i) => `$${i + 2}`)
        .join(",");
      query += ` AND c.descricao IN (${placeholders})`;

      values.push(...filtroCategorias);
    }

    const result = await pool.query(query, values);
    const transacoes = result.rows;

    return res.json(transacoes);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
}

async function detailTransaction(req, res) {
  const user = req.user;
  const { id } = req.params;

  try {
    const { rows, rowCount } = await pool.query(
      "select * from transacoes where usuario_id = $1 AND id = $2",
      [user.id, id]
    );

    if (rowCount < 1) {
      return res
        .status(404)
        .json({ mensagem: `Erro interno do servidor ${error.message}` });
    }

    const [transaction] = rows;

    return res.status(200).json(transaction);
  } catch (error) {
    return res
      .status(500)
      .json({ mensagem: `Erro interno do servidor: ${error.message}` });
  }
}

async function transactionsCreate(req, res) {
  const { id: usuario_id } = req.user;
  const {
    descricao,
    valor,
    data: data_transacao,
    categoria_id,
    tipo,
  } = req.body;
  const { descricao: categoria_nome } = req.categoriaAtual;

  try {
    const transacao = await pool.query(
      `INSERT INTO transacoes (tipo, descricao, valor, data, usuario_id, categoria_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [tipo, descricao, valor, data_transacao, usuario_id, categoria_id]
    );

    if (transacao.rows.length <= 0)
      return res.status(400).json({ mensagem: "Operação falhou!" });

    const resposta = {
      id: transacao.rows[0].id,
      tipo,
      descricao,
      valor: parseFloat(valor),
      data: data_transacao,
      usuario_id,
      categoria_id,
      categoria_nome,
    };

    return res.json({ ...resposta });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
}

async function updateTransaction(req, res) {
  const user = req.user;
  const { id } = req.params;
  const { descricao, valor, data, categoria_id, tipo } = req.body;

  if (!descricao || !valor || !data || !categoria_id || !tipo) {
    return res
      .status(400)
      .json({ mensagem: "Todos os campos devem ser preenchidos" });
  }

  try {
    const transaction = await pool.query(
      "select * from transacoes where usuario_id = $1 and id = $2",
      [user.id, id]
    );

    if (transaction.rowCount < 1) {
      return res
        .status(404)
        .json({ mensagem: "A transação informada não foi encontrada" });
    }

    const category = await pool.query(
      "select * from categorias where id = $1",
      [categoria_id]
    );

    if (category.rowCount <= 0) {
      return res
        .status(404)
        .json({ mensagem: "A categoria informada não foi encontrada" });
    }

    const updateQuery =
      "update transacoes set descricao = $1, valor = $2, data = $3, categoria_id = $4, tipo = $5 WHERE id = $6";
    const updateParams = [descricao, valor, data, categoria_id, tipo, id];
    const updatedTransaction = await pool.query(updateQuery, updateParams);

    if (updatedTransaction.rowCount < 1) {
      return res
        .status(500)
        .json({ mensagem: `Erro interno do servidor: ${error.message}` });
    }

    return res.status(204).send();
  } catch (error) {
    return res
      .status(500)
      .json({ mensagem: `Erro interno do servidor: ${error.message}` });
  }
}

async function deleteTransaction(req, res) {
  const { id } = req.params;

  try {
    const result = await pool.query("DELETE FROM transacoes WHERE id=$1", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ mensagem: "Transação não encontrada" });
    }

    res.status(204).send();
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .json({ mensagem: `Erro interno do servidor: ${error.message}` });
  }
}

async function bankReport(req, res) {
  const { filtro } = req.query;
  const { id } = req.user;
  const resposta = [];

  try {
    let transacoesResult = await pool.query(
      `SELECT c.descricao, t.tipo, SUM(t.valor) AS valor FROM transacoes t LEFT JOIN categorias c ON c.id = t.categoria_id WHERE usuario_id = $1 GROUP BY c.descricao, t.tipo`,
      [id]
    );
    const transacoes = transacoesResult.rows;

    if (filtro) {
      for (let element of filtro) {
        for (let transacao of transacoes) {
          if (transacao.descricao === element) {
            resposta.push(transacao);
          }
        }
      }
      return res.json(somaValoresFiltradosdos(resposta));
    }

    return res.json(somaValoresFiltrados(transacoes));
  } catch (error) {
    return res
      .status(500)
      .json({ mensagem: `Erro interno do servidor: ${error.message}` });
  }
}

async function listUserCategories(req, res) {
  const { id: usuario_id } = req.user;
  const resposta = [];

  try {
    const { rows: categorias } = await pool.query(
      `SELECT c.descricao AS descricao
                   FROM transacoes t
                   LEFT JOIN categorias c ON c.id = t.categoria_id
                   WHERE t.usuario_id = $1
                   GROUP BY c.descricao`,
      [usuario_id]
    );

    if (categorias.length <= 0) {
      return res
        .status(404)
        .json({ mensagem: "Usuário sem transações cadastradas!" });
    }

    categorias.map((resp) => {
      resposta.push(resp.descricao);
    });

    return res.json(resposta);
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor." });
  }
}

module.exports = {
  registerUser,
  login,
  userDetail,
  updateUser,
  categoryList,
  transactionsList,
  detailTransaction,
  transactionsCreate,
  updateTransaction,
  deleteTransaction,
  bankReport,
  listUserCategories,
};
