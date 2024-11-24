document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const userInfo = parseJwt(token);

  // Charger les utilisateurs pour le champ matriculeGestionnaire
  try {
    const response = await fetch("/api/users", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      const users = await response.json();
      const matriculeSelect = document.getElementById("matriculeGestionnaire");
      users.forEach((user) => {
        const option = document.createElement("option");
        option.value = user.id;
        option.textContent = `${user.prenom} ${user.nom} (${user.id})`;
        matriculeSelect.appendChild(option);
      });

      // Sélectionner l'utilisateur connecté par défaut
      if (userInfo) {
        matriculeSelect.value = userInfo.id;
      }
    } else {
      console.error("Erreur lors du chargement des utilisateurs.");
    }
  } catch (error) {
    console.error("Erreur lors du chargement des utilisateurs :", error);
  }

  // Affichage conditionnel pour les champs "Autre"
  document.getElementById("nombreDossiers").addEventListener("change", (e) => {
    document.getElementById("nombreDossiersCustom").style.display =
      e.target.value === "custom" ? "block" : "none";
  });

  document.getElementById("montantEstime").addEventListener("change", (e) => {
    document.getElementById("montantEstimeCustom").style.display =
      e.target.value === "custom" ? "block" : "none";
  });

  // Soumission du formulaire
  document
    .getElementById("createClientForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(e.target);
      const clientData = Object.fromEntries(formData.entries());

      if (clientData.nombreDossiers === "custom") {
        clientData.nombreDossiers = formData.get("nombreDossiersCustom");
      }
      if (clientData.montantEstime === "custom") {
        clientData.montantEstime = formData.get("montantEstimeCustom");
      }

      // Génération automatique de l'ID client
      const date = new Date();
      clientData.id = `${date.getFullYear()}${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}${date.getDate().toString().padStart(2, "0")}${date
        .getHours()
        .toString()
        .padStart(2, "0")}${date.getMinutes().toString().padStart(2, "0")}`;

      try {
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
        document.getElementById("statusMessage").style.color = "green";
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
});

// Fonction pour décoder un token JWT
function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch (error) {
    console.error("Erreur lors du décodage du token :", error);
    return null;
  }
}
