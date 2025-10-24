CREATE DATABASE cantina;
USE cantina;

CREATE TABLE aluno (
    id_aluno INT AUTO_INCREMENT PRIMARY KEY,
    nome_aluno VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE produtos (
    id_produtos INT AUTO_INCREMENT PRIMARY KEY,
    nome_produtos VARCHAR(50) NOT NULL,
    preco DECIMAL(10, 2) NOT NULL 
);

CREATE TABLE adm (
    id_adm INT AUTO_INCREMENT PRIMARY KEY,
    nome_adm VARCHAR(50) NOT NULL,
    cpf VARCHAR(11) NOT NULL UNIQUE
);

CREATE TABLE pedidos (
    id_pedidos INT AUTO_INCREMENT PRIMARY KEY,
    numero INT NOT NULL,
    id_aluno INT NOT NULL,
    FOREIGN KEY (id_aluno) REFERENCES aluno(id_aluno)
);

CREATE TABLE itens_pedido (
    id_item INT AUTO_INCREMENT PRIMARY KEY,
    id_pedidos INT NOT NULL,
    id_produtos INT NOT NULL,
    
    quantidade INT NOT NULL,
    
    FOREIGN KEY (id_pedidos) REFERENCES pedidos(id_pedidos),
    FOREIGN KEY (id_produtos) REFERENCES produtos(id_produtos)
);
