const express = require("express");
const verifyLoggedUser = require("./middlewares/authentication");
const routes = express();
const {
  registerUser,
  login,
  userDetail,
  updateUser,
  categoryList,
  transactionsCreate,
  transactionsList,
  detailTransaction,
  updateTransaction,
  deleteTransaction,
  bankReport,
  listUserCategories,
} = require("./controllers/controllers");
const { verifyTransation } = require("./middlewares/mdUserLogado");

routes.post("/usuario", registerUser);
routes.post("/login", login);

routes.use(verifyLoggedUser);

routes.get("/usuario", userDetail);
routes.get("/usuario/categoria", listUserCategories);
routes.put("/usuario", updateUser);
routes.get("/categoria", categoryList);
routes.get("/transacao", transactionsList);
routes.get("/transacao/extrato", bankReport);
routes.get("/transacao/:id", detailTransaction);
routes.post("/transacao", verifyTransation, transactionsCreate);
routes.put("/transacao/:id", updateTransaction);
routes.delete("/transacao/:id", deleteTransaction);

module.exports = routes;
