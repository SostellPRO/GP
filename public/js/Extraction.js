document.addEventListener("DOMContentLoaded", () => {
  const filterForm = document.getElementById("filterForm");
  const clientTableBody = document.querySelector("#clientTable tbody");
  const exportButton = document.getElementById("exportButton");
  const matriculeSelect = document.getElementById("matriculeGestionnaire");

  // Charger les gestionnaires
  async function loadUsers() {
    const response = await fetch("/api/users");
    const users = await response.json();
    users.forEach((user) => {
      const option = document.createElement("option");
      option.value = user.id;
      option.textContent = `${user.prenom} ${user.nom} (${user.id})`;
      matriculeSelect.appendChild(option);
    });
  }

  loadUsers();

  // Appliquer les filtres
  filterForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(filterForm);
    const filters = Object.fromEntries(formData.entries());

    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`/api/clients?${queryParams}`);
    const clients = await response.json();

    // Afficher les résultats dans le tableau
    clientTableBody.innerHTML = "";
    clients.forEach((client) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${client.id}</td>
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
  });

  // Exporter les données
  exportButton.addEventListener("click", () => {
    const rows = Array.from(clientTableBody.querySelectorAll("tr")).map((row) =>
      Array.from(row.querySelectorAll("td")).map((cell) => cell.textContent)
    );

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        "ID,Raison Sociale,Secteur Activité,SIREN,SIRET,Typologie,Nom Interlocuteur,Prénom Interlocuteur,Adresse,Code Postal,Téléphone,E-mail,Date Prochaine Action,Statut",
      ]
        .concat(rows.map((row) => row.join(",")))
        .join("\n");

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute(
      "download",
      `export_client_${new Date()
        .toISOString()
        .replace(/[-:]/g, "")
        .slice(0, 15)}.csv`
    );
    link.click();
  });
});
