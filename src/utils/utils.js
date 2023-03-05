function somaValoresFiltrados(transacoes) {
  const extrato = { entrada: 0, saida: 0 };
  transacoes.map((op) => {
    if (op.tipo === "entrada") {
      extrato.entrada += parseFloat(op.valor);
    } else if (op.tipo === "saida") {
      extrato.saida += parseFloat(op.valor);
    }
  });
  return extrato;
}

module.exports = {
  somaValoresFiltrados,
};
