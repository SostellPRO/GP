document.getElementById("uploadForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData();
  const fileInput = document.getElementById("campaignFile");
  formData.append("campaignFile", fileInput.files[0]);

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
    document.getElementById("importStatus").textContent =
      `Importation réussie : ${result.count} clients ajoutés.`;
  } catch (error) {
    document.getElementById("importStatus").textContent = error.message;
  }
});
