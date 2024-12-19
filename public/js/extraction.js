document.addEventListener("DOMContentLoaded", () => {
  const filterForm = document.getElementById("filterForm");
  const clientTableBody = document.querySelector("#clientTable tbody");
  const exportButton = document.getElementById("exportButton");
  const matriculeSelect = document.getElementById("matriculeGestionnaire");
  const retour = document.getElementById("retourButton");

  // Charger les gestionnaires
  async function loadUsers() {
    try {
      const response = await fetch("/api/users");
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des gestionnaires.");
      }
      const users = await response.json();

      // Ajouter les gestionnaires au champ de sélection
      matriculeSelect.innerHTML = `<option value="Tous">Tous</option>`;
      users.forEach((user) => {
        const option = document.createElement("option");
        option.value = user.id; // Utilise l'ID comme valeur
        option.textContent = `${user.prenom} ${user.nom} (${user.id})`;
        matriculeSelect.appendChild(option);
      });
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs :", error);
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

    // Ajouter le filtre matriculeGestionnaire si sélectionné
    const selectedMatricule = matriculeSelect.value;
    if (selectedMatricule !== "Tous") {
      filters["matriculeGestionnaire"] = selectedMatricule;
    }

    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(`/api/clients?${queryParams}`);

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des clients.");
      }

      const clients = await response.json();
      clientTableBody.innerHTML = ""; // Vider le tableau avant de le remplir

      if (clients.length === 0) {
        clientTableBody.innerHTML = `<tr><td colspan="17">Aucun résultat trouvé pour les filtres sélectionnés.</td></tr>`;
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
          <td>${client.nombreDossiers || "Non défini"}</td>
          <td>${formatMontant(client.montantEstime)}</td>
          <td>${client.historique?.[0] || "Aucun commentaire"}</td>
          <td>${client.dateProchaineAction || "Non définie"}</td>
          <td>${client.statut}</td>
        `;
        clientTableBody.appendChild(row);
      });
    } catch (error) {
      console.error("Erreur lors du chargement des clients :", error);
      clientTableBody.innerHTML = `<tr><td colspan="17">Erreur : ${error.message}</td></tr>`;
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
      "Volumétrie",
      "Montant Estimé",
      "Commentaire",
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
    link.download = `export_client_${new Date()
      .toISOString()
      .replace(/[-:]/g, "")
      .slice(0, 15)}.xlsx`;
    link.click();
  });

  // Fonction pour formater les montants
  function formatMontant(montant) {
    if (!montant || montant === "Non défini") {
      return "Non défini";
    }
    const formatted = Number(montant.replace(/[^\d.-]/g, "")).toLocaleString(
      "fr-FR",
      { style: "currency", currency: "EUR" }
    );
    return formatted || montant;
  }

  // Navigation vers la page d'accueil
  retour.addEventListener("click", navigateToAgenda);
  function navigateToAgenda() {
    window.location.href = "/home.html";
  }
});
