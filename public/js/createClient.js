document
  .getElementById("createClientForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const clientData = Object.fromEntries(formData.entries());

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(clientData),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la création du client.");
      }

      document.getElementById("statusMessage").textContent =
        "Client créé avec succès !";
      e.target.reset();
    } catch (error) {
      document.getElementById("statusMessage").textContent =
        error.message || "Erreur inconnue.";
      document.getElementById("statusMessage").style.color = "red";
    }
  });

document.getElementById("backToHome").addEventListener("click", () => {
  window.location.href = "/home.html";
});
