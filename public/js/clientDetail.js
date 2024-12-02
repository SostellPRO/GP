document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const clientId = urlParams.get("id");
  let currentHistorique = []; // Historique local pour gérer les commentaires

  if (!clientId) {
    alert("Aucun client trouvé.");
    window.location.href = "/agenda.html";
    return;
  }

  // Charger les données du client
  try {
    const response = await fetch(`/api/clients/${clientId}`);
    if (!response.ok)
      throw new Error("Erreur lors de la récupération du client.");

    const client = await response.json();
    populateClientForm(client); // Remplir le formulaire avec les données
    currentHistorique = [...client.historique] || []; // Charger l'historique initial
    updateHistoriqueDisplay(currentHistorique); // Afficher l'historique
  } catch (error) {
    alert(error.message);
    window.location.href = "/agenda.html";
  }

  // Charger les gestionnaires
  try {
    const response = await fetch(`/api/users`);
    if (!response.ok)
      throw new Error("Erreur lors du chargement des gestionnaires.");

    const gestionnaires = await response.json();
    populateGestionnaires(gestionnaires);
  } catch (error) {
    console.error(error.message);
  }

  // Soumission du formulaire principal
  document
    .getElementById("clientFormDetail")
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
        statut: document.getElementById("statut").value,
        dateProchaineAction: document.getElementById("dateProchaineAction")
          .value,
      };

      try {
        const response = await fetch(`/api/clients/${clientId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedClient),
        });

        if (!response.ok) throw new Error("Erreur lors de la mise à jour.");
        alert("Les données ont été mises à jour avec succès.");
      } catch (error) {
        alert(error.message);
      }
    });

  // Ajouter un commentaire
  document.getElementById("addComment").addEventListener("click", async () => {
    const commentaire = document.getElementById("commentaire").value.trim();

    if (!commentaire) {
      alert("Veuillez entrer un commentaire valide.");
      return;
    }

    const newComment = `[${new Date().toLocaleString("fr-FR")}] ${commentaire}`;

    try {
      const response = await fetch(`/api/clients/${clientId}/historique`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentaire: newComment }),
      });

      if (!response.ok)
        throw new Error("Erreur lors de l'ajout du commentaire.");

      // Mettre à jour localement sans recharger tout l'historique
      currentHistorique.unshift(newComment);
      updateHistoriqueDisplay(currentHistorique);

      // Réinitialiser le champ commentaire
      document.getElementById("commentaire").value = "";
    } catch (error) {
      alert(error.message);
    }
  });
});

// Remplir les champs du formulaire
function populateClientForm(client) {
  const fieldMapping = {
    raisonSociale: "raisonSociale",
    secteurActivite: "secteurActivite",
    siren: "siren",
    siret: "siret",
    typologie: "typologie",
    civilite: "civilite",
    nomInterlocuteur: "nomInterlocuteur",
    prenomInterlocuteur: "prenomInterlocuteur",
    telephone1: "telephone1",
    telephone2: "telephone2",
    mail1: "mail1",
    mail2: "mail2",
    adressePostale: "adressePostale",
    complementAdresse: "complementAdresse",
    codePostal: "codePostal",
    nombreDossiers: "nombreDossiers",
    montantEstime: "montantEstime",
    statut: "statut",
    dateProchaineAction: "dateProchaineAction",
  };

  for (const [fieldId, clientKey] of Object.entries(fieldMapping)) {
    const element = document.getElementById(fieldId);
    if (element && client[clientKey] !== undefined) {
      element.value = client[clientKey];
    }
  }
}

// Afficher les gestionnaires
function populateGestionnaires(gestionnaires) {
  const select = document.getElementById("matriculeGestionnaire");
  select.innerHTML = ""; // Réinitialiser les options
  gestionnaires.forEach((gestionnaire) => {
    const option = document.createElement("option");
    option.value = gestionnaire.id;
    option.textContent = `${gestionnaire.prenom} ${gestionnaire.nom}`;
    select.appendChild(option);
  });
}

// Mettre à jour l'affichage de l'historique
function updateHistoriqueDisplay(historique) {
  const historiqueList = document.getElementById("historiqueList");
  historiqueList.innerHTML = "";

  if (!historique || historique.length === 0) {
    const emptyMessage = document.createElement("li");
    emptyMessage.textContent = "Aucun commentaire.";
    historiqueList.appendChild(emptyMessage);
    return;
  }

  historique.forEach((entry) => {
    const li = document.createElement("li");
    li.textContent = entry;
    historiqueList.appendChild(li);
  });
}
