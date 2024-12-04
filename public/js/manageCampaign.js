document.getElementById("uploadForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const fileInput = document.getElementById("campaignFile");
  const file = fileInput.files[0]; // Récupère le fichier sélectionné

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

  const formData = new FormData(); // Crée une instance de FormData
  formData.append("campaignFile", file); // Ajoute le fichier au FormData
  console.log("FormData keys:", Array.from(formData.keys())); // Vérifie le contenu du FormData

  try {
    const response = await fetch("/api/clients/import", {
      method: "POST",
      body: formData,
    });
    console.log("Réponse brute du serveur :", response);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Erreur lors de l'importation.");
    }

    const result = await response.json();
    console.log("Résultat du traitement :", result);
    if (response.ok) {
      const invalidCount = result.invalidRows.length;
      const successMessage = `Importation réussie : ${result.addedCount} clients ajoutés.`;
      const errorMessage =
        invalidCount > 0
          ? ` ${invalidCount} lignes ignorées en raison de données manquantes.`
          : "";
      document.getElementById("importStatus").textContent =
        successMessage + errorMessage;
    } else {
      document.getElementById("importStatus").textContent = result.error;
    }
  } catch (error) {
    document.getElementById("importStatus").textContent =
      "Erreur lors de l'importation.";
    console.error(error);
  }
});
