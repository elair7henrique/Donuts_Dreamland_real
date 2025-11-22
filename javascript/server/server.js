const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const app = express();
app.use(express.json());
app.use(cors());

// Conexão com MySQL
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "202074Dl", // sua senha correta aqui
  database: "donutsdreamland"
});

db.connect(err => {
  if (err) return console.error("Erro ao conectar:", err);
  console.log("Conectado ao MySQL!");
});

// -------------------------
// ROTA DE CADASTRO
// -------------------------
app.post("/cadastro", async (req, res) => {
  const { email, numero, senha } = req.body;

  const hash = await bcrypt.hash(senha, 10);

  db.query(
    "INSERT INTO usuarios (email, numero, senha) VALUES (?, ?, ?)",
    [email, numero, hash],
    (err) => {
      if (err) {
        return res.status(400).json({ mensagem: "Erro: email já existe ou erro no banco." });
      }

      res.json({ mensagem: "Usuário cadastrado com sucesso!" });
    }
  );
});

// -------------------------
// ROTA DE LOGIN
// -------------------------
app.post("/login", (req, res) => {
  const { email, senha } = req.body;

  db.query(
    "SELECT * FROM usuarios WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) return res.status(500).json({ message: "Erro no servidor" });

      if (results.length === 0)
        return res.status(401).json({ message: "Usuário não encontrado" });

      const usuario = results[0];
      const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

      if (!senhaCorreta)
        return res.status(401).json({ message: "Senha incorreta" });

      res.json({ message: "Login OK" });
    }
  );
});

app.listen(3000, () => console.log("Servidor rodando na porta 3000"));