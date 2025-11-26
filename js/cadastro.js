document.addEventListener("DOMContentLoaded", () => {
  const email = document.getElementById("email");
  const numero = document.getElementById("number");
  const senha = document.getElementById("senha");
  const form = document.getElementById("cadastroForm");

  form.addEventListener("submit", async (e) => {
  e.preventDefault();

    const dados = {
      email: email.value,
      numero: numero.value,
      senha: senha.value,
    };

    try {
      const response = await fetch("http://localhost:3000/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      });

      const resultado = await response.json();
      alert(resultado.mensagem || "Cadastro feito com sucesso!")

      if (response.ok) {
        window.location.href = "login.html"
      }
    } catch (erro) {
      console.error("Erro na requisição:", erro);
      alert("Erro ao conectar com o servidor.");

    }
  });
});

  