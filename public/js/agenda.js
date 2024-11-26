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

function displayClients(clients) {
  const clientList = document.getElementById("client-list");
  clientList.innerHTML = clients
    .map((client) => {
      console.log(client.id); // Affiche l'ID du client dans la console
      return `
        <div>
          <p><strong>${client.raisonSociale}</strong></p>
          <p>Statut : ${client.statut}</p>
          <p>Typologie : ${client.typologie}</p>
          <p>Commentaire : ${client.historique[0]}</p>
          <p><a href="clientDetail.html?id=${client.id}">Voir les détails</a></p>
        </div>`;
    })
    .join("");
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
