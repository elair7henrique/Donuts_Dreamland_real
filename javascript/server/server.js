const express = require("express");
<<<<<<< HEAD
const cors = require("cors");
const path = require("path");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

// -----------------------------------------------------
// ARQUIVOS ESTÁTICOS E ROTA PRINCIPAL
// -----------------------------------------------------
app.use(express.static(path.join(__dirname, "../../")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../../index.html"));
});

// -----------------------------------------------------
// CONEXÃO COM O MYSQL LOCAL
// -----------------------------------------------------

// ⚠️ Ajuste aqui conforme seu MySQL local
const db = mysql.createConnection({
  host: "localhost",
  user: "root",        // ou o user que você usa
  password: "123abc",  // sua senha
  database: "donuts_dreamland",
  port: 3306
});

// Testa conexão
db.connect((err) => {
  if (err) {
    console.error("❌ ERRO ao conectar no MySQL:", err);
  } else {
    console.log("🟢 MySQL conectado com sucesso!");
  }
});

// -----------------------------------------------------
// ROTA: CADASTRO
// -----------------------------------------------------
app.post("/cadastro", async (req, res) => {
  const { email, numero, senha } = req.body;

  if (!email || !numero || !senha) {
    return res.status(400).json({ mensagem: "Preencha todos os campos!" });
  }

  try {
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const sql = "INSERT INTO usuario (email, numero, senha) VALUES (?, ?, ?)";
    db.query(sql, [email, numero, senhaCriptografada], (err) => {
      if (err) {
        console.error("Erro no MySQL:", err);
        return res.status(500).json({ mensagem: "Erro ao cadastrar usuário." });
      }

      res.json({ mensagem: "Usuário cadastrado com sucesso!" });
    });
  } catch (error) {
    res.status(500).json({ mensagem: "Erro interno." });
  }
});

// -----------------------------------------------------
// ROTA: LOGIN
// -----------------------------------------------------
app.post("/login", (req, res) => {
  const { email, senha } = req.body;

  db.query("SELECT * FROM usuario WHERE email = ?", [email], async (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ erro: "Erro no banco de dados" });
    }

    if (results.length === 0) {
      return res.status(401).json({ erro: "Usuário não encontrado" });
    }

    const usuario = results[0];
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

    if (!senhaCorreta) {
      return res.status(401).json({ erro: "Senha incorreta" });
    }

    res.json({ mensagem: "Login bem-sucedido", nome: usuario.nome });
  });
});

// -----------------------------------------------------
// INICIA O SERVIDOR
// -----------------------------------------------------
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
=======
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
>>>>>>> bdd52b46e6142b2229fbc3a89bb9b0f4c717105c
