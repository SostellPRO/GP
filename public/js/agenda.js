document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const userInfo = parseJwt(token);
  console.log(userInfo);

  if (userInfo) {
    document.getElementById("user-id").textContent = userInfo.id;
    document.getElementById("user-name").textContent =
      `${userInfo.prenom} ${userInfo.nom}`;
    loadClients("En attente d'appel", userInfo.id);
  } else {
    alert("Erreur d'authentification. Veuillez vous reconnecter.");
    window.location.href = "/login.html";
  }
});

async function loadClients(status, userId) {
  const token = localStorage.getItem("token");

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

let currentPage = 1;
const itemsPerPage = 8; // 4 lignes, 2 colonnes par ligne

function displayClients(clients) {
  const clientList = document.getElementById("client-list");
  const totalPages = Math.ceil(clients.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const clientsToDisplay = clients.slice(startIndex, endIndex);

  clientList.innerHTML = clientsToDisplay
    .map(
      (client) => `
      <div class="client-card">
        <h3>${client.raisonSociale}</h3>
        <p>Statut: ${client.statut}</p>
        <p>Typologie: ${client.typologie}</p>
        <p>Commentaire : ${
          client.historique?.[0]?.slice(0, 50) || "Aucun commentaire disponible"
        }</p>
        <p>Prochaine action: ${client.dateProchaineAction || "Non définie"}</p>
        <a href="clientDetail.html?id=${client.id}">Voir les détails</a>
      </div>
    `
    )
    .join("");

  updatePaginationControls(totalPages);
}

function updatePaginationControls(totalPages) {
  const paginationContainer = document.querySelector(".pagination");
  paginationContainer.innerHTML = `
    <button onclick="changePage(-1)" ${currentPage === 1 ? "disabled" : ""}>
      Précédent
    </button>
    <span>Page ${currentPage} sur ${totalPages}</span>
    <button onclick="changePage(1)" ${
      currentPage === totalPages ? "disabled" : ""
    }>
      Suivant
    </button>
  `;
}

function changePage(direction) {
  currentPage += direction;
  loadClients(
    "En attente d'appel",
    document.getElementById("user-id").textContent
  );
}
