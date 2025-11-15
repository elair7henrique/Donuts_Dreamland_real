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
// Servir o FRONTEND
// =======================
app.use(express.static(path.join(__dirname, "../../")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../../index.html"));
});

// =======================
// Banco de Dados
// =======================
const { Pool } = require("pg");
const bcrypt = require("bcrypt");

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "202074",
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_DATABASE || "donuts_db_h1b0",
  ssl: process.env.DB_HOST ? { rejectUnauthorized: false } : false
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
    console.error("Erro no banco:", err);
    res.status(500).json({ mensagem: "Erro ao cadastrar usuário." });
  }
});

// =======================
// Iniciar servidor
// =======================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
