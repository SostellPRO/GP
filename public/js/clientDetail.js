document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const clientId = urlParams.get("id");

  if (!clientId) {
    alert("Aucun client trouvé.");
    window.location.href = "/agenda.html";
    return;
  }

  try {
    const response = await fetch(`/api/clients/${clientId}`);
    if (!response.ok) throw new Error("Erreur lors de la récupération.");

    const client = await response.json();
    populateClientForm(client);
  } catch (error) {
    alert(error.message);
  }
});

function populateClientForm(client) {
  document.getElementById("raisonSociale").value = client.raisonSociale || "";
  document.getElementById("secteurActivite").value =
    client.secteurActivite || "";
  document.getElementById("siren").value = client.siren || "";
  document.getElementById("siret").value = client.siret || "";
  document.getElementById("nombreDossiers").value = client.nombreDossiers || 0;
  document.getElementById("montantEstime").value = client.montantEstime || 0;
  document.getElementById("statut").value =
    client.statut || "En attente d'appel";
}

document.getElementById("clientForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const updatedClient = {
    raisonSociale: document.getElementById("raisonSociale").value,
    secteurActivite: document.getElementById("secteurActivite").value,
    siren: document.getElementById("siren").value,
    siret: document.getElementById("siret").value,
    nombreDossiers: document.getElementById("nombreDossiers").value,
    montantEstime: document.getElementById("montantEstime").value,
    statut: document.getElementById("statut").value,
  };

  try {
    const response = await fetch(`/api/clients/${clientId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedClient),
    });

    if (!response.ok) throw new Error("Erreur lors de la mise à jour.");

    alert("Client mis à jour avec succès.");
    window.location.href = "/agenda.html";
  } catch (error) {
    alert(error.message);
  }
});

function navigateToAgenda() {
  window.location.href = "/agenda.html";
}
