document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const userInfo = parseJwt(token);
  const commentaires = [];
  const footer = document.getElementById("footer");

  // Charger les utilisateurs dans le champ "matriculeGestionnaire"
  await loadUsers(token, userInfo);

  // Affichage conditionnel des champs "Autre"
  setupConditionalFields();

  // Gestion de l'historique des commentaires
  setupHistorique(commentaires);

  // Gestion de la visibilité du footer
  setupFooterVisibility(footer);

  // Soumission du formulaire
  document
    .getElementById("createClientForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      await submitForm(e, commentaires, token);
    });

  // Gestion de l'importation de fichier
  document
    .getElementById("uploadForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const fileInput = document.getElementById("campaignFile");
      const file = fileInput.files[0];

      if (!file) {
        document.getElementById("importStatus").textContent =
          "Veuillez sélectionner un fichier.";
        return;
      }

      const allowedExtensions = /(\.csv|\.xlsx)$/i;
      if (!allowedExtensions.exec(file.name)) {
        document.getElementById("importStatus").textContent =
          "Seuls les fichiers CSV ou Excel sont acceptés.";
        return;
      }

      const formData = new FormData();
      formData.append("campaignFile", file);

      try {
        const response = await fetch("/api/clients/import", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Erreur lors de l'importation.");
        }

        const result = await response.json();
        const importedClients = result.addedClients;

        // Generate unique IDs for each imported client
        importedClients.forEach((client) => {
          const date = new Date();
          client.id = `${date.getFullYear()}${(date.getMonth() + 1)
            .toString()
            .padStart(
              2,
              "0"
            )}${date.getDate().toString().padStart(2, "0")}${date
            .getHours()
            .toString()
            .padStart(2, "0")}${date.getMinutes().toString().padStart(2, "0")}`;
        });

        const successMessage = `Importation réussie : ${result.addedCount} clients ajoutés.`;
        const invalidCount = result.invalidRows.length;
        const errorMessage =
          invalidCount > 0
            ? ` ${invalidCount} lignes ignorées en raison de données incorrectes.`
            : "";
        document.getElementById("importStatus").textContent =
          successMessage + errorMessage;
      } catch (error) {
        document.getElementById("importStatus").textContent =
          "Erreur lors de l'importation.";
        console.error(error);
      }
    });

  // Redirection vers la page d'accueil
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

// Charger les utilisateurs et les ajouter au champ matriculeGestionnaire
async function loadUsers(token, userInfo) {
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
}

// Affichage conditionnel pour les champs "Autre"
function setupConditionalFields() {
  document.getElementById("nombreDossiers").addEventListener("change", (e) => {
    document.getElementById("nombreDossiersCustom").style.display =
      e.target.value === "custom" ? "block" : "none";
  });

  document.getElementById("montantEstime").addEventListener("change", (e) => {
    document.getElementById("montantEstimeCustom").style.display =
      e.target.value === "custom" ? "block" : "none";
  });
}

// Gestion de l'historique des commentaires
function setupHistorique(commentaires) {
  const historiqueList = document.getElementById("historiqueList");
  const addCommentButton = document.getElementById("addComment");
  const commentaireField = document.getElementById("commentaire");

  addCommentButton.addEventListener("click", () => {
    const commentaire = commentaireField.value.trim();
    if (commentaire) {
      const timestamp = new Date().toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      const historiqueEntry = `[${timestamp}] ${commentaire}`;
      commentaires.unshift(historiqueEntry);
      updateHistoriqueDisplay(historiqueList, commentaires);
      commentaireField.value = "";
    }
  });
}

// Mettre à jour l'affichage de l'historique
function updateHistoriqueDisplay(historiqueList, commentaires) {
  historiqueList.innerHTML = "";
  commentaires.forEach((entry) => {
    const li = document.createElement("li");
    li.textContent = entry;
    historiqueList.appendChild(li);
  });
}

// Gestion de la visibilité du footer
function setupFooterVisibility(footer) {
  window.addEventListener("scroll", () => {
    const scrollPosition = window.scrollY + window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    if (scrollPosition >= documentHeight - 50) {
      footer.classList.add("visible");
    } else {
      footer.classList.remove("visible");
    }
  });
}

// Soumission du formulaire
async function submitForm(e, commentaires, token) {
  const formData = new FormData(e.target);
  const clientData = Object.fromEntries(formData.entries());

  clientData.dateProchaineAction = formData.get("dateProchaineAction");

  if (clientData.nombreDossiers === "custom") {
    clientData.nombreDossiers = formData.get("nombreDossiersCustom");
  }
  if (clientData.montantEstime === "custom") {
    clientData.montantEstime = formData.get("montantEstimeCustom");
  }

  clientData.historique = commentaires;

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
}
