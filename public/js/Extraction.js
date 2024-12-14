document.addEventListener("DOMContentLoaded", () => {
  const filterForm = document.getElementById("filterForm");
  const clientTableBody = document.querySelector("#clientTable tbody");
  const exportButton = document.getElementById("exportButton");
  const matriculeSelect = document.getElementById("matriculeGestionnaire");

  // Charger les gestionnaires
  async function loadUsers() {
    try {
      const response = await fetch("/api/users");
      if (!response.ok)
        throw new Error("Erreur lors du chargement des gestionnaires.");
      const users = await response.json();

      users.forEach((user) => {
        const option = document.createElement("option");
        option.value = user.id;
        option.textContent = `${user.prenom} ${user.nom} (${user.id})`;
        matriculeSelect.appendChild(option);
      });
    } catch (error) {
      console.error(error);
    }
  }

  loadUsers();

  // Appliquer les filtres
  filterForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(filterForm);
    const filters = Object.fromEntries(formData.entries());

    // Nettoyage des filtres inutiles
    Object.keys(filters).forEach((key) => {
      if (filters[key] === "Tous" || filters[key] === "") {
        delete filters[key];
      }
    });

    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(`/api/clients?${queryParams}`);
      if (!response.ok)
        throw new Error("Erreur lors de la récupération des clients.");
      const clients = await response.json();

      // Afficher les résultats dans le tableau
      clientTableBody.innerHTML = "";
      if (clients.length === 0) {
        clientTableBody.innerHTML = `<tr><td colspan="14">Aucun résultat trouvé pour les filtres sélectionnés.</td></tr>`;
        return;
      }

      clients.forEach((client) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td><a href="/clientDetail.html?id=${client.id}" class="client-link">${client.id}</a></td>
          <td>${client.raisonSociale}</td>
          <td>${client.secteurActivite}</td>
          <td>${client.siren}</td>
          <td>${client.siret}</td>
          <td>${client.typologie}</td>
          <td>${client.nomInterlocuteur}</td>
          <td>${client.prenomInterlocuteur}</td>
          <td>${client.adressePostale}</td>
          <td>${client.codePostal}</td>
          <td>${client.telephone1}</td>
          <td>${client.mail1}</td>
          <td>${client.dateProchaineAction || "Non définie"}</td>
          <td>${client.statut}</td>
        `;
        clientTableBody.appendChild(row);
      });
    } catch (error) {
      console.error(error);
    }
  });

  // Exporter les données au format Excel
  exportButton.addEventListener("click", () => {
    const rows = Array.from(clientTableBody.querySelectorAll("tr")).map((row) =>
      Array.from(row.querySelectorAll("td")).map((cell) => cell.textContent)
    );

    const headers = [
      "ID",
      "Raison Sociale",
      "Secteur Activité",
      "SIREN",
      "SIRET",
      "Typologie",
      "Nom Interlocuteur",
      "Prénom Interlocuteur",
      "Adresse",
      "Code Postal",
      "Téléphone",
      "E-mail",
      "Date Prochaine Action",
      "Statut",
    ];

    const worksheetData = [headers, ...rows];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Clients");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `export_client_${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}.xlsx`;
    link.click();
  });
});

// Fonction pour naviguer vers la page d'accueil
function navigateToAgenda() {
  window.location.href = "/home.html";
}
