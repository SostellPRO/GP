document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const clientId = urlParams.get("id");

  if (!clientId) {
    alert("Aucun client trouvé.");
    window.location.href = "/agenda.html"; // Redirection vers l'agenda
    return;
  }

  try {
    // Récupérer les détails du client
    const response = await fetch(`/api/clients/${clientId}`);
    if (!response.ok)
      throw new Error("Erreur lors de la récupération du client.");
    const client = await response.json();

    populateClientForm(client); // Remplir le formulaire avec les données
  } catch (error) {
    alert(error.message);
    window.location.href = "/agenda.html"; // Redirection en cas d'erreur
  }

  // Ajouter un événement pour soumettre le formulaire
  document
    .getElementById("clientForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const updatedClient = {
        raisonSociale: document.getElementById("raisonSociale").value,
        secteurActivite: document.getElementById("secteurActivite").value,
        siren: document.getElementById("siren").value,
        siret: document.getElementById("siret").value,
        typologie: document.getElementById("typologie").value,
        civilite: document.getElementById("civilite").value,
        nomInterlocuteur: document.getElementById("nomInterlocuteur").value,
        prenomInterlocuteur: document.getElementById("prenomInterlocuteur")
          .value,
        telephone1: document.getElementById("telephone1").value,
        telephone2: document.getElementById("telephone2").value,
        mail1: document.getElementById("mail1").value,
        mail2: document.getElementById("mail2").value,
        adressePostale: document.getElementById("adressePostale").value,
        complementAdresse: document.getElementById("complementAdresse").value,
        codePostal: document.getElementById("codePostal").value,
        nombreDossiers: document.getElementById("nombreDossiers").value,
        montantEstime: document.getElementById("montantEstime").value,
        dateProchaineAction: document.getElementById("dateProchaineAction")
          .value,

        statut: document.getElementById("statut").value,
      };

      try {
        const response = await fetch(`/api/clients/${clientId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedClient),
        });

        if (!response.ok) throw new Error("Erreur lors de la mise à jour.");

        // Rediriger vers la page agenda après mise à jour
        window.location.href = "/agenda.html";
      } catch (error) {
        alert(error.message);
      }
    });

  // Ajouter un événement pour ajouter un commentaire
  document.getElementById("addComment").addEventListener("click", async () => {
    const commentaire = document.getElementById("commentaire").value.trim();

    if (!commentaire) {
      alert("Veuillez entrer un commentaire.");
      return;
    }

    try {
      const response = await fetch(`/api/clients/${clientId}/historique`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentaire }),
      });

      if (!response.ok)
        throw new Error("Erreur lors de l'ajout du commentaire.");

      const updatedClient = await response.json();
      updateHistorique(updatedClient.historique);
      document.getElementById("commentaire").value = ""; // Réinitialiser le champ
    } catch (error) {
      alert(error.message);
    }
  });
});

// Remplir les champs du formulaire avec les données du client
function populateClientForm(client) {
  document.getElementById("raisonSociale").value = client.raisonSociale || "";
  document.getElementById("secteurActivite").value =
    client.secteurActivite || "";
  document.getElementById("siren").value = client.siren || "";
  document.getElementById("siret").value = client.siret || "";
  document.getElementById("typologie").value = client.typologie || "B2B";
  document.getElementById("civilite").value = client.civilite || "M";
  document.getElementById("nomInterlocuteur").value =
    client.nomInterlocuteur || "";
  document.getElementById("prenomInterlocuteur").value =
    client.prenomInterlocuteur || "";
  document.getElementById("telephone1").value = client.telephone1 || "";
  document.getElementById("telephone2").value = client.telephone2 || "";
  document.getElementById("mail1").value = client.mail1 || "";
  document.getElementById("mail2").value = client.mail2 || "";
  document.getElementById("adressePostale").value = client.adressePostale || "";
  document.getElementById("complementAdresse").value =
    client.complementAdresse || "";
  document.getElementById("codePostal").value = client.codePostal || "";
  document.getElementById("nombreDossiers").value =
    client.nombreDossiers || "<10";
  document.getElementById("montantEstime").value =
    client.montantEstime || "<500";
  document.getElementById("statut").value =
    client.statut || "En attente d'appel";

  updateHistorique(client.historique);
}

// Mettre à jour la liste des commentaires dans la section historique
function updateHistorique(historique) {
  const historiqueList = document.getElementById("historiqueList");
  historiqueList.innerHTML = ""; // Réinitialiser la liste

  if (!historique || historique.length === 0) {
    const emptyMessage = document.createElement("li");
    emptyMessage.textContent = "Aucun commentaire.";
    historiqueList.appendChild(emptyMessage);
    return;
  }

  historique.forEach((comment) => {
    const li = document.createElement("li");
    li.textContent = comment;
    historiqueList.appendChild(li);
  });
}

function navigateToAgenda() {
  window.location.href = "/agenda.html";
}
