// ================== IMPORTAÇÕES ==================
const express = require("express");
const cors = require("cors");
const path = require("path");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
require("dotenv").config();
console.log("DATABASE_URL LIDA PELO NODE:", process.env.DATABASE_URL);

const app = express();
app.use(express.json());

// ================== CONFIGURAÇÃO DO CORS ==================
app.use(
  cors({
    origin: [
      "http://localhost:5501",
      "https://donuts-dreamland-real-6.onrender.com"
    ],
    methods: ["GET", "POST"],
  })
);

// ================== CONEXÃO COM PostgreSQL (Render) ==================
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Teste de conexão
pool.connect()
  .then(() => console.log("🟢 Conectado ao PostgreSQL!"))
  .catch(err => console.error("🔴 ERRO AO CONECTAR NO BANCO:", err));

// ================== ROTA DE CADASTRO ==================
app.post("/cadastro", async (req, res) => {
  console.log("📩 Dados recebidos:", req.body);

  const { email, numero, senha } = req.body;

  if (!email || !numero || !senha) {
    return res.status(400).json({ erro: "Campos obrigatórios faltando!" });
  }

  try {
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const query = `
      INSERT INTO usuarios (email, numero, senha)
      VALUES ($1, $2, $3)
      RETURNING id;
    `;

    const result = await pool.query(query, [
      email,
      numero,
      senhaCriptografada,
    ]);

    console.log("✅ Usuário inserido com ID:", result.rows[0].id);

    res.status(201).json({ mensagem: "Usuário cadastrado com sucesso!" });
  } catch (erro) {
    console.error("❌ ERRO NO BANCO:", erro);
    res.status(500).json({ erro: "Erro interno no servidor." });
  }
});

// ================== SERVIDOR ==================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});