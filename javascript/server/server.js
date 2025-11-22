const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors());

// ======================
//  SERVIR SITE PUBLICO
// ======================
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ======================
//  CONEXÃO COM MYSQL
// ======================
// ⚠️ COLOQUE AQUI OS DADOS DO MYSQL DA RAILWAY
const db = mysql.createConnection({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT
});

db.connect(err => {
  if (err) return console.error("Erro ao conectar ao MySQL:", err);
  console.log("Conectado ao MySQL da Railway!");
});

// ======================
//  ROTA DE CADASTRO
// ======================
app.post("/cadastro", async (req, res) => {
  const { email, numero, senha } = req.body;

  try {
    const hash = await bcrypt.hash(senha, 10);

    db.query(
      "INSERT INTO usuarios (email, numero, senha) VALUES (?, ?, ?)",
      [email, numero, hash],
      (err) => {
        if (err) {
          return res.status(400).json({
            mensagem: "Erro: email já existe ou erro no banco."
          });
        }

        res.json({ mensagem: "Usuário cadastrado com sucesso!" });
      }
    );
  } catch (error) {
    res.status(500).json({ mensagem: "Erro no servidor" });
  }
});

// ======================
//  ROTA DE LOGIN
// ======================
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

// ======================
//  PORTA RAILWAY
// ======================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log("Servidor rodando na porta " + PORT)
);