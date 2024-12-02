// script.js
document.addEventListener("DOMContentLoaded", async () => {
  const API_URL = "/api/clients"; // Remplacez par l'URL correcte
  const clientTableBody = document.querySelector("#clientTable tbody");

  try {
    const response = await fetch(API_URL);
    if (!response.ok)
      throw new Error("Erreur lors de la récupération des clients.");

    const clients = await response.json();

    // Filtrer les clients ayant les statuts "Signé" ou "Fin de communication"
    const filteredClients = clients.filter((client) =>
      ["Signé", "Fin de communication"].includes(client.statut)
    );

    // Trier par ordre alphabétique de raison sociale
    filteredClients.sort((a, b) =>
      a.raisonSociale.localeCompare(b.raisonSociale)
    );

    // Afficher les clients
    populateClientTable(filteredClients, clientTableBody);
  } catch (error) {
    console.error("Erreur :", error.message);
    clientTableBody.innerHTML = `<tr><td colspan="10">Erreur lors du chargement des clients.</td></tr>`;
  }
});

function populateClientTable(clients, tableBody) {
  tableBody.innerHTML = ""; // Nettoyer les données existantes

  clients.forEach((client) => {
    const dernierCommentaire =
      client.historique?.[0] || "Aucun commentaire disponible";
    const dateProchaineAction = client.dateProchaineAction
      ? new Date(client.dateProchaineAction).toLocaleDateString("fr-FR")
      : "Non définie";

    const row = `
      <tr>
        <td><a href="clientDetail.html?id=${client.id}">${client.id}</a></td>
        <td>${client.raisonSociale}</td>
        <td>${client.secteurActivite}</td>
        <td>${client.siren}</td>
        <td>${client.typologie}</td>
        <td>${client.nombreDossiers}</td>
        <td>${client.montantEstime}</td>
        <td>${client.matriculeGestionnaire}</td>
        <td>${dateProchaineAction}</td>
        <td>${dernierCommentaire}</td>
      </tr>
    `;
    tableBody.insertAdjacentHTML("beforeend", row);
  });
}
