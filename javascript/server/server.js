const express = require("express");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcrypt");
const { Pool } = require("pg");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

app.use(express.static(path.join(__dirname, "../../")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../../index.html"));
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.post("/cadastro", async (req, res) => {
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
    res.status(500).json({ mensagem: "Erro ao cadastrar usuário." });
  }
});

app.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  try {
    const result = await pool.query("SELECT * FROM usuario WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(401).json({ erro: "Usuário não encontrado" });
    }

    const usuario = result.rows[0];
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

    if (!senhaCorreta) {
      return res.status(401).json({ erro: "Senha incorreta" });
    }

    res.json({ mensagem: "Login bem-sucedido", nome: usuario.email });
  } catch {
    res.status(500).json({ erro: "Erro ao fazer login" });
  }
});

app.post("/enviar-email", async (req, res) => {
  const { nome, email, mensagem } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: email,
      to: process.env.EMAIL_USER,
      subject: "Nova mensagem via site Donuts Dreamland",
      text: `Nome: ${nome}\nE-mail: ${email}\n\nMensagem:\n${mensagem}`,
    });

    res.json({ success: true, message: "Mensagem enviada!" });
  } catch {
    res.status(500).json({ error: "Erro ao enviar email." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});