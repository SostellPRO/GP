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
  titleElement.textContent = status.toUpperCase(); // Met à jour le titre avec le statut sélectionné

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

// Fonction unique pour afficher les clients avec pagination et suppression
function displayClients(clients) {
  const clientList = document.getElementById("client-list");
  const paginationContainer = document.getElementById("pagination-container");
  const cardsPerPage = 8; // Nombre de clients par page
  let currentPage = 0;

  // Récupérer le titre actuel pour déterminer l'affichage
  const title = document.querySelector(".title_partie2_agenda").textContent;
  const isCardMode = title === "EN ATTENTE D'APPEL" || title === "À RAPPELER";

  // Calcul du nombre total de pages
  const totalPages = Math.ceil(clients.length / cardsPerPage);

  const displayPage = () => {
    const start = currentPage * cardsPerPage;
    const end = start + cardsPerPage;
    const visibleClients = clients.slice(start, end);

    if (isCardMode) {
      // Mode cartes
      clientList.classList.remove("table-mode");
      clientList.innerHTML = visibleClients
        .map(
          (client) => `
          <div class="client-card">
            <p><strong>${client.raisonSociale}</strong></p>
            <p><strong>Statut</strong> : ${client.statut}</p>
            <p><strong>Typologie</strong> : ${client.typologie}</p>
            <p><strong>Date prochaine action</strong> : ${
              client.dateProchaineAction || "Non définie"
            }</p>
            <p><a href="clientDetail.html?id=${client.id}">Voir les détails</a></p>
            <button class="delete-btn" onclick="deleteClient('${client.id}')">🗑️</button>
          </div>`
        )
        .join("");
    } else {
      // Mode tableau
      clientList.classList.add("table-mode");
      clientList.innerHTML = `
      <table>
        <thead>
          <tr>
            <th class="table-cell">Raison Sociale</th>
            <th class="table-cell">Statut</th>
            <th class="table-cell">Typologie</th>
            <th class="table-cell">Date Prochaine Action</th>
            <th class="table-cell">Détail</th>
          </tr>
        </thead>
        <tbody>
          ${visibleClients
            .map(
              (client) => `
              <tr class="table-row">
                <td class="table-cell">${client.raisonSociale}</td>
                <td class="table-cell">${client.statut}</td>
                <td class="table-cell">${client.typologie}</td>
                <td class="table-cell">${
                  client.dateProchaineAction || "Non définie"
                }</td>
                <td class="table-cell"><a href="clientDetail.html?id=${client.id}">Voir les détails</a></td>
              </tr>`
            )
            .join("")}
        </tbody>
      </table>`;
    }

    // Ajouter les contrôles de pagination
    paginationContainer.innerHTML = `
      <div class="pagination-controls">
        <button ${currentPage === 0 ? "disabled" : ""} onclick="changePage(-1)">←</button>
        <span>Page ${currentPage + 1} / ${totalPages}</span>
        <button ${
          currentPage === totalPages - 1 ? "disabled" : ""
        } onclick="changePage(1)">→</button>
      </div>`;
  };

  // Fonction pour changer de page
  window.changePage = (direction) => {
    currentPage += direction;
    displayPage();
  };

  displayPage();
}

// Fonction pour supprimer un client
async function deleteClient(clientId) {
  const confirmDelete = confirm(
    "Êtes-vous sûr de vouloir supprimer ce client ?"
  );
  if (!confirmDelete) return;

  const token = localStorage.getItem("token");
  try {
    const response = await fetch(`/api/clients/${clientId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      alert("Client supprimé avec succès.");
      location.reload(); // Recharger les données après suppression
    } else {
      alert("Erreur lors de la suppression du client.");
    }
  } catch (error) {
    console.error("Erreur :", error);
    alert("Erreur lors de la suppression du client.");
  }
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
