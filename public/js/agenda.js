document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const userInfo = parseJwt(token);

  if (userInfo) {
    // Afficher l'ID utilisateur et le nom dans la zone utilisateur
    document.getElementById("user-id").textContent = userInfo.id;
    document.getElementById("user-name").textContent =
      `${userInfo.prenom} ${userInfo.nom}`;

    // Définir le titre par défaut comme "Lead"
    const defaultTitle = "Lead";
    document.querySelector(".title_partie2_agenda").textContent = defaultTitle;

    // Charger les clients par défaut pour le statut "Lead"
    loadClients("En attente d'appel", userInfo.id);
  } else {
    alert("Erreur d'authentification. Veuillez vous reconnecter.");
    window.location.href = "/login.html";
  }
});

async function loadClients(status, userId) {
  const token = localStorage.getItem("token");

  // Met à jour le titre avec le texte du bouton cliqué
  const titleElement = document.querySelector(".title_partie2_agenda");
  titleElement.textContent = status; // Met à jour le titre avec le statut sélectionné

  try {
    const response = await fetch(`/api/clients?status=${status}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error("Erreur lors du chargement des clients.");
    }

    const clients = await response.json();

    // Filtrer les clients selon le matriculeGestionnaire
    const filteredClients = clients.filter(
      (client) => client.matriculeGestionnaire === userId
    );

    displayClients(filteredClients);
  } catch (error) {
    console.error("Erreur :", error);
    document.getElementById("client-list").textContent =
      "Impossible de charger les clients.";
  }
}

function displayClients(clients) {
  const clientList = document.getElementById("client-list");
  clientList.innerHTML = clients
    .map((client) => {
      console.log(client.id); // Affiche l'ID du client dans la console
      return `
        <div>
          <p><strong>${client.raisonSociale}</strong></p>
          <p><strong>Statut</strong> : ${client.statut}</p>
          <p><strong>Typologie</strong> : ${client.typologie}</p>
          <p><strong>Date prochaine action</strong> : ${client.dateProchaineAction}</p>
          <p><strong>Commentaire</strong> : ${
            client.historique?.[0] || "Aucun commentaire"
          }</p>
          <p><a href="clientDetail.html?id=${client.id}">Voir les détails</a></p>
        </div>`;
    })
    .join(""); // Joindre les éléments générés pour obtenir une chaîne unique
}

// Fonction pour décoder un JWT
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
