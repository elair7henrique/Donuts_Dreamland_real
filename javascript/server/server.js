const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
require("dotenv").config();

app.use(cors({
  origin: [
    "http://localhost:5501",
    "http://127.0.0.1:5501",
    "https://donuts-dreamland-real-6.onrender.com"
  ],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

// =======================
// SERVE O FRONTEND
// =======================
app.use(express.static(path.join(__dirname, "../../")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../../index.html"));
});

// =======================
// BANCO DE DADOS
// =======================
const { Pool } = require("pg");
const bcrypt = require("bcrypt");

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
  ssl: { rejectUnauthorized: false } // Render usa SSL
});

// =======================
// ROTA DE CADASTRO
// =======================
app.post("/cadastro", async (req, res) => {
  console.log("📩 Dados recebidos:", req.body);

  const { email, numero, senha } = req.body;

  if (!email || !numero || !senha) {
    return res.status(400).json({ mensagem: "Preencha todos os campos!" });
  }

  try {
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    await pool.query(
      "INSERT INTO usuario (email, numero, senha) VALUES ($1, $2, $3)",
      [email, numero, senhaCriptografada]
    );

    res.json({ mensagem: "Usuário cadastrado com sucesso!" });

  } catch (err) {
    console.error("❌ ERRO NO BANCO:", err);
    res.status(500).json({ mensagem: "Erro ao cadastrar usuário." });
  }
});

// =======================
// INICIAR SERVIDOR
// =======================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});