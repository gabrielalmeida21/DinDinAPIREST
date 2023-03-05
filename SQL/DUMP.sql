CREATE DATABASE dindin;

DROP TABLE IF EXISTS usuarios;

CREATE TABLE usuarios (
    id serial primary key,
    nome text NOT NULL,
    email text NOT NULL UNIQUE,
    senha text NOT NULL
);

DROP TABLE IF EXISTS categorias;

CREATE TABLE categorias (
    id serial primary key,
    descricao text NOT NULL
);

DROP TABLE IF EXISTS transacoes;

CREATE TABLE transacoes (
    id serial primary key,
    tipo text NOT NULL,
    descricao text NOT NULL,
    valor integer NOT NULL,
    data varchar(255),
    usuario_id integer NOT NULL,
    categoria_id integer NOT NULL,
    foreign key (usuario_id) references usuarios (id),
    foreign key (categoria_id) references categorias (id)
);

INSERT INTO categorias (descricao) VALUES
('Alimentação'),
('Assinaturas e Serviços'),
('Casa'),
('Mercado'),
('Cuidados Pessoais'),
('Educação'),
('Família'),
('Lazer'),
('Pets'),
('Presentes'),
('Roupas'),
('Saúde'),
('Transporte'),
('Salário'),
('Vendas'),
('Outras receitas'),
('Outras despesas');