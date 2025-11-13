// ================== IMPORTAÇÕES ==================
const express = require("express");
const cors = require("cors");
const path = require("path");
const { Pool } = require("pg");
const bcrypt = require("bcrypt"); // use bcryptjs se o deploy falhar no Render
require("dotenv").config();

const app = express();
app.use(express.json());

// ================== CONFIGURAÇÃO DO CORS ==================
app.use(
  cors({
    origin: [
      "http://localhost:5501",
      "http://127.0.0.1:5501",
      "https://donuts-dreamland.onrender.com" // domínio do site hospedado
    ],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

// ================== SERVIR O FRONTEND ==================
app.use(express.static(path.join(__dirname, "../../"))); // Serve HTML, CSS e JS

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../../index.html"));
});

// ================== CONEXÃO COM O BANCO DE DADOS ==================
const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "1234567890",
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_DATABASE || "donuts_dreamland",
  ssl: process.env.DB_HOST ? { rejectUnauthorized: false } : false, // SSL só no Render
});

// Testa conexão ao iniciar
pool.connect()
  .then(() => console.log("✅ Conexão com PostgreSQL bem-sucedida!"))
  .catch((err) => {
    console.error("❌ Erro ao conectar ao PostgreSQL:", err.message);
    console.error("💡 Dica: verifique se o PostgreSQL está rodando e se as credenciais estão certas.");
  });

// ================== ROTA DE CADASTRO ==================
app.post("/cadastro", async (req, res) => {
  console.log("📩 Dados recebidos do frontend:", req.body);
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

    console.log("✅ Usuário cadastrado com sucesso!");
    res.json({ mensagem: "Usuário cadastrado com sucesso!" });
  } catch (err) {
    console.error("💥 Erro no banco de dados:", err.message);
    res.status(500).json({ mensagem: "Erro ao cadastrar usuário." });
  }
});

// ================== ROTA DE LOGIN ==================
app.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: "Preencha todos os campos!" });
  }

  try {
    const result = await pool.query("SELECT * FROM usuario WHERE email = $1", [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ erro: "Usuário não encontrado" });
    }

    const usuario = result.rows[0];
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

    if (!senhaCorreta) {
      return res.status(401).json({ erro: "Senha incorreta" });
    }

    console.log("✅ Login bem-sucedido:", usuario.email);
    res.json({ mensagem: "Login bem-sucedido", usuario: usuario.email });
  } catch (err) {
    console.error("💥 Erro no login:", err.message);
    res.status(500).json({ erro: "Erro ao fazer login." });
  }
});

// ================== INICIAR SERVIDOR ==================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});