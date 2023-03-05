# Back-End do aplicativo DINDIN.

Este projeto é a parte backend de um projeto fullstack de uma aplicação desenvolvida para o desafio do módulo 3 da Cubos Academy.

A API consiste em toda uma estrutura backend e o esquema do banco de dados utilizando POSTGRE SQL.

Javascript foi a única linguagem de programação utilizada nessa aplicação.

#API DINDIN:

>**Cadastrar Usuário** `POST` `/usuario`

> **Fazer Login** `POST` `/login`

> **Detalhar Perfil do Usuário Logado** :heavy_exclamation_mark: `GET` `/usuario`

> **Editar Perfil do Usuário Logado** :heavy_exclamation_mark: `PUT` `/usuario`

> **Listar categorias**  :heavy_exclamation_mark: `GET`  `/categoria`

> **Listar transações** :heavy_exclamation_mark: `GET` `/transacao`

> **Detalhar transação** :heavy_exclamation_mark: `GET` `/transacao/:id`

> **Cadastrar transação** :heavy_exclamation_mark: `POST` `/transacao`

> **Editar transação** :heavy_exclamation_mark: `PUT` `/transacao/:id`

> **Remover transaçãoObter extrato de transações**  :heavy_exclamation_mark: `DELETE` `/transacao/:id`

> **Filtrar transações por categoria** :heavy_exclamation_mark: `GET` `/transacao/extrato`

Todas os endpoints com ":heavy_exclamation_mark:" precisam de validação por token para ser utilizada.

# Como funciona o projeto:

O projeto consiste em uma API REST para uma plataforma Web de um banco.

#Endpoints:

Neste projeto foram utilizados as seguintes dependências:

> Reinicialização automática do servidor: `nodemon: ^2.0.19`

> Método de criptografia: `bcrypt: ^5.0.1`

> Framework: `express: ^4.18.1`

> Padrão para autenticação: `jsonwebtoken: ^8.5.1`

> Conexão com o PostgreSQL: `pg: ^8.7.3`