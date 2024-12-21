document.getElementById("uploadForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const fileInput = document.getElementById("campaignFile");
  const file = fileInput.files[0];

  if (!file) {
    document.getElementById("importStatus").textContent =
      "Veuillez sélectionner un fichier.";
    return;
  }

  const allowedExtensions = /(\.csv|\.xlsx)$/i;
  if (!allowedExtensions.exec(file.name)) {
    document.getElementById("importStatus").textContent =
      "Seuls les fichiers CSV ou Excel sont acceptés.";
    return;
  }

  const formData = new FormData();
  formData.append("campaignFile", file);

  try {
    const response = await fetch("/api/clients/import", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Erreur lors de l'importation.");
    }

    const result = await response.json();
    let importedClients = result.addedClients;

    // Générer les IDs localement pour chaque client
    importedClients = importedClients.map((client) => ({
      ...client,
      id: generateClientId(), // Ajout de l'ID unique pour chaque client
    }));

    const successMessage = `Importation réussie : ${result.addedCount} clients ajoutés.`;
    const invalidCount = result.invalidRows.length;
    const errorMessage =
      invalidCount > 0
        ? ` ${invalidCount} lignes ignorées en raison de données incorrectes.`
        : "";
    document.getElementById("importStatus").textContent =
      successMessage + errorMessage;
  } catch (error) {
    document.getElementById("importStatus").textContent =
      "Erreur lors de l'importation.";
    console.error(error);
  }
});

// Fonction pour générer un ID unique
function generateClientId() {
  const date = new Date();
  return `${date.getFullYear()}${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}${date.getDate().toString().padStart(2, "0")}${date
    .getHours()
    .toString()
    .padStart(2, "0")}${date.getMinutes().toString().padStart(2, "0")}${date
    .getSeconds()
    .toString()
    .padStart(2, "0")}${Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")}`;
}
