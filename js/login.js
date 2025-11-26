const formLogin = document.getElementById("loginForm");

if (formLogin) {
  formLogin.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("✅ Login realizado com sucesso!");
        window.location.href = "index.html"; // redireciona para a página principal
      } else {
        alert("⚠️ " + (data.message || "E-mail ou senha incorretos!"));
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("❌ Erro ao conectar ao servidor.");
    }
  });
}