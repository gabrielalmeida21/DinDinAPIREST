const pool = require("../instance");

const verifyTransation = async (req, res, next) => {
  const { categoria_id, tipo } = req.body;
  const arrayDeTipos = ["entrada", "saida"];

  if (!categoria_id) {
    return res.status(404).json({ mensagem: "Escolha uma categoria" });
  }

  const tipoValido = arrayDeTipos.some((element) => {
    return element === tipo;
  });

  if (!tipoValido) {
    return res
      .status(400)
      .json({ mensagem: "O tipo de transação é inválida." });
  }

  try {
    const { rows: categoriaAtual } = await pool.query(
      "SELECT * FROM categorias WHERE id=$1",
      [categoria_id]
    );

    req.categoriaAtual = categoriaAtual[0];
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }

  next();
};

const verifyUpdateRegister = async (req, res, next) => {
  const { nome, email, senha } = req.body;
  const { email: usuario_email } = req.usuario;

  if (
    !verificarDados(res, {
      nome: nome.trim(),
      email: email.trim(),
      senha: senha.trim(),
    })
  )
    return;

  const emailCadastrado = await verificarEmailCadastrado(res, { email });
  if (emailCadastrado.length > 0 && email !== usuario_email) {
    return res.status(400).json({ mensagem: "Email ou senha inválido(s)" });
  }

  next();
};

const verifyUserLogged = async (req, res, next) => {
  const { id: transacao_id } = req.params;
  const { id: usuario_id } = req.usuario;

  try {
    const { rows } = await pool.query(
      "SELECT * FROM transacoes WHERE id = $1 AND usuario_id = $2",
      [transacao_id, usuario_id]
    );

    if (rows.length <= 0)
      return res.status(404).json({ mensagem: "Transação não encontrada." });
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }

  next();
};

module.exports = {
  verifyTransation,
  verifyUpdateRegister,
  verifyUserLogged,
};
