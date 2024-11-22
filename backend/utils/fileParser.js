const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");

// Chemin du fichier de stockage des clients
const clientsFilePath = path.join(__dirname, "../data/clients.json");

/**
 * Fonction pour lire et convertir un fichier Excel en JSON
 * @param {string} filePath - Chemin du fichier Excel
 * @returns {Array} - Liste des données extraites du fichier
 */
function parseExcel(filePath) {
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0]; // Récupère la première feuille
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    return data;
  } catch (error) {
    console.error("Erreur lors de la lecture du fichier Excel :", error);
    throw new Error("Le fichier Excel est invalide ou corrompu.");
  }
}

/**
 * Fonction pour importer des clients depuis un fichier Excel et les stocker dans un fichier JSON
 * @param {string} filePath - Chemin du fichier Excel
 * @returns {Object} - Résultat de l'importation
 */
function importClients(filePath) {
  try {
    const clientsFromExcel = parseExcel(filePath);
    const existingClients = JSON.parse(
      fs.readFileSync(clientsFilePath, "utf8")
    );

    // Génère des IDs uniques pour chaque client importé
    const newClients = clientsFromExcel.map((client, index) => ({
      id: `${new Date().toISOString().replace(/[-:.TZ]/g, "")}${index + 1}`,
      raisonSociale: client["Raison sociale"] || "",
      secteurActivite: client["Secteur d'activité"] || "",
      siren: client["SIREN"] || "",
      siret: client["SIRET"] || "",
      typologie: client["Typologie créances"] || "B2B",
      civilite: client["Civilité"] || "M",
      nomInterlocuteur1: client["Nom interlocuteur 1"] || "",
      prenomInterlocuteur1: client["Prénom interlocuteur 1"] || "",
      telephone1: client["Téléphone 1 interlocuteur 1"] || "",
      telephone2: client["Téléphone 2 interlocuteur 1"] || "",
      mail1: client["Mail 1 interlocuteur 1"] || "",
      mail2: client["Mail 2 interlocuteur 1"] || "",
      adressePostale: client["Adresse postale"] || "",
      codePostal: client["Code postal"] || "",
      nombreDossiers: client["Nombre de dossiers"] || 0,
      montantEstime: client["Montant estimé"] || 0,
      statut: client["Statut"] || "En attente d'appel",
      matriculeGestionnaire: client["Matricule gestionnaire"] || "",
      dateStatut:
        client["Date statut"] || new Date().toISOString().split("T")[0],
      derniersCommentaires: client["Derniers Commentaires"] || "",
    }));

    // Ajoute les nouveaux clients aux clients existants
    const updatedClients = [...existingClients, ...newClients];

    // Sauvegarde dans le fichier JSON
    fs.writeFileSync(
      clientsFilePath,
      JSON.stringify(updatedClients, null, 2),
      "utf8"
    );

    return { count: newClients.length, success: true };
  } catch (error) {
    console.error("Erreur lors de l'importation des clients :", error);
    throw new Error("Erreur lors de l'importation des clients.");
  }
}

module.exports = { parseExcel, importClients };
