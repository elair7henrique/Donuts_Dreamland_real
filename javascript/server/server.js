const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();

app.use(cors({
  origin: ["*"] // libera o Live Server local
}));

app.use(express.json());

// ------------------------------
// SERVIR O FRONTEND
// ------------------------------
app.use(express.static(path.join(__dirname, "../../"))); // serve HTML, CSS e JS

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../../index.html"));
});

// ------------------------------
// CONEXÃO COM O BANCO DE DADOS
// ------------------------------

const { Pool } = require("pg");
const bcrypt = require("bcrypt");
  
// Usa variáveis de ambiente no Render ou configuração local
const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "202074",
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_DATABASE || "donuts_db_h1b0",
  ssl: process.env.DB_HOST ? { rejectUnauthorized: false } : false // SSL apenas no Render
});

// ------------------------------
// ROTAS DO CADASTRO
// ------------------------------

app.post("/cadastro", async (req, res) => {
  console.log("📩 Dados recebidos do frontend:", req.body);
  const { email, numero, senha   } = req.body;

  if (!email || !numero || !senha) {
    console.log("Erro: algum campo está vazio");
    return res.status(400).json({ mensagem: "Preencha todos os campos!" });
  }

  try {
    const senhaCriptografada = await bcrypt.hash(senha, 10);
    await pool.query(
      "INSERT INTO usuario (email, numero, senha) VALUES ($1, $2, $3)",
      [nome, email, senhaCriptografada, estado, cidade]
    );
    res.json({ mensagem: "Usuário cadastrado com sucesso!" });
  } catch (err) {
    console.error("Erro no banco de dados:", err);
    res.status(500).json({ mensagem: "Erro ao cadastrar usuário." });
  }
});

// ------------------------------
// ROTA DE LOGIN DO CLIENTE
// ------------------------------

app.post("/login", async (req, res) => {
  const { email, senha } = req.body;

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

    console.log("Usuário logado com sucesso:", usuario.nome);
    res.json({ mensagem: "Login bem-sucedido", nome: usuario.nome });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao fazer login" });
  }
});

// ------------------------------
// INICIA O SERVIDOR
// ------------------------------

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
