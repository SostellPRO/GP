document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const userInfo = parseJwt(token);

  if (userInfo) {
    // Afficher les informations de l'utilisateur
    document.getElementById("user-id").textContent = userInfo.id;
    document.getElementById("user-name").textContent =
      `${userInfo.prenom} ${userInfo.nom}`;

    // Définir le titre par défaut et charger les clients
    const defaultTitle = "En attente d'appel";
    document.querySelector(".title_partie2_agenda").textContent = defaultTitle;
    loadClients(defaultTitle, userInfo.id);
  } else {
    alert("Erreur d'authentification. Veuillez vous reconnecter.");
    window.location.href = "/login.html";
  }
});

let currentSort = { criterion: "raisonSociale", order: "asc" };

// Charger les clients selon le statut sélectionné
async function loadClients(status, userId) {
  const token = localStorage.getItem("token");

  // Met à jour le titre de la section
  const titleElement = document.querySelector(".title_partie2_agenda");
  titleElement.textContent = status.toUpperCase();

  try {
    const response = await fetch(`/api/clients?status=${status}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error("Erreur lors du chargement des clients.");
    }

    const clients = await response.json();

    // Filtrer les clients selon l'utilisateur
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

// Fonction pour trier les clients
function sortClients(criterion, order) {
  currentSort = { criterion, order };
  const status = document.querySelector(".title_partie2_agenda").textContent;
  const userId = document.getElementById("user-id").textContent;
  loadClients(status, userId);
}

// Afficher les clients avec pagination
function displayClients(clients) {
  const clientList = document.getElementById("client-list");
  const paginationContainer = document.getElementById("pagination-container");
  const cardsPerPage = 8; // Nombre de clients par page
  let currentPage = 0;

  // Tri des clients selon le critère et l'ordre
  clients.sort((a, b) => {
    if (currentSort.criterion === "raisonSociale") {
      return currentSort.order === "asc"
        ? a.raisonSociale.localeCompare(b.raisonSociale)
        : b.raisonSociale.localeCompare(a.raisonSociale);
    } else if (currentSort.criterion === "dateProchaineAction") {
      const dateA = new Date(a.dateProchaineAction || 0);
      const dateB = new Date(b.dateProchaineAction || 0);
      return currentSort.order === "asc" ? dateA - dateB : dateB - dateA;
    }
  });

  const displayPage = () => {
    const start = currentPage * cardsPerPage;
    const end = start + cardsPerPage;
    const visibleClients = clients.slice(start, end);

    clientList.innerHTML = visibleClients
      .map(
        (client) => `
      <div class="client-card">
        <p><strong>Raison Sociale:</strong> ${client.raisonSociale}</p>
        <p><strong>Typologie:</strong> ${client.typologie}</p>
        <p><strong>Secteur:</strong> ${client.secteurActivite}</p>
        <p><strong>Nombre de Dossiers:</strong> ${client.nombreDossiers}</p>
        
        <p><strong>Date Prochaine Action:</strong> ${
          client.dateProchaineAction || "Non définie"
        }</p>
        <p><strong>Dernier commentaire:</strong> ${client.historique[0]}</p>
        <p><a href="clientDetail.html?id=${client.id}">Voir les détails</a></p>
        ${
          client.role === "Administrateur" || client.role === "Superviseur"
            ? `<button class="delete-btn" onclick="deleteClient('${client.id}')">🗑️</button>`
            : ""
        }
      </div>`
      )
      .join("");

    // Pagination
    const totalPages = Math.ceil(clients.length / cardsPerPage);
    paginationContainer.innerHTML = `
      <div class="pagination-controls">
        <button ${currentPage === 0 ? "disabled" : ""} onclick="changePage(-1)">←</button>
        <span>Page ${currentPage + 1} / ${totalPages}</span>
        <button ${
          currentPage === totalPages - 1 ? "disabled" : ""
        } onclick="changePage(1)">→</button>
      </div>`;
  };

  // Change la page courante
  window.changePage = (direction) => {
    currentPage += direction;
    displayPage();
  };

  displayPage();
}

// Supprimer un client
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
      location.reload();
    } else {
      alert("Erreur lors de la suppression du client.");
    }
  } catch (error) {
    console.error("Erreur :", error);
    alert("Erreur lors de la suppression du client.");
  }
}

// Décoder un JWT
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
