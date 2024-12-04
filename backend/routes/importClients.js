const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const xlsx = require("xlsx");
const csvParser = require("csv-parser");

const router = express.Router();
const clientsFilePath = path.join(__dirname, "../data/clients.json");

// Configuration multer
const upload = multer({ dest: "uploads/" });

// Vérifie et crée le fichier clients.json s'il est manquant
if (!fs.existsSync(clientsFilePath)) {
  fs.writeFileSync(clientsFilePath, JSON.stringify([]));
}

// Fonction pour lire les clients
const readClients = () => {
  try {
    const data = fs.readFileSync(clientsFilePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Erreur lors de la lecture des clients :", error);
    return [];
  }
};

// Fonction pour écrire les clients
const writeClients = (clients) => {
  try {
    fs.writeFileSync(clientsFilePath, JSON.stringify(clients, null, 2));
  } catch (error) {
    console.error("Erreur lors de l'écriture des clients :", error);
    throw new Error("Erreur lors de l'écriture des clients.");
  }
};

// Fonction pour traiter les fichiers CSV
const processCSVFile = async (filePath) => {
  const results = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", (err) => reject(err));
  });
};

// Normalise les en-têtes
const normalizeHeaders = (headers) =>
  headers.map((h) => h.trim().toLowerCase());

// Nettoie les valeurs des lignes
const cleanRow = (row) => {
  Object.keys(row).forEach((key) => {
    if (row[key] === undefined || row[key] === null) {
      row[key] = ""; // Remplace les valeurs nulles ou undefined par une chaîne vide
    } else if (typeof row[key] !== "string") {
      row[key] = String(row[key]).trim(); // Convertit les valeurs non chaînes en chaînes et supprime les espaces
    } else {
      row[key] = row[key].trim(); // Supprime les espaces pour les chaînes
    }
  });
  return row;
};

// Route pour l'importation des clients
router.post("/import", upload.single("campaignFile"), async (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "Aucun fichier fourni." });
  }

  try {
    const extension = path.extname(file.originalname).toLowerCase();
    let jsonData = [];

    // Lecture des fichiers Excel ou CSV
    if (extension === ".xlsx" || extension === ".xls") {
      const workbook = xlsx.readFile(file.path);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      jsonData = xlsx.utils.sheet_to_json(sheet, { defval: "" });
    } else if (extension === ".csv") {
      jsonData = await processCSVFile(file.path);
    } else {
      return res
        .status(400)
        .json({ error: "Format de fichier non pris en charge." });
    }

    // Nettoyage des données
    jsonData = jsonData.map(cleanRow);
    console.log("Données brutes reçues :", jsonData);

    // Validation des en-têtes obligatoires
    const requiredHeaders = ["raisonSociale", "siren", "nomInterlocuteur"]; // En-têtes obligatoires seulement

    const actualHeaders = normalizeHeaders(Object.keys(jsonData[0] || {}));
    const expectedHeaders = normalizeHeaders(requiredHeaders);
    const missingHeaders = expectedHeaders.filter(
      (header) => !actualHeaders.includes(header)
    );

    if (missingHeaders.length > 0) {
      return res.status(400).json({
        error: `Colonnes manquantes ou mal nommées : ${missingHeaders.join(", ")}`,
      });
    }

    const clients = readClients();
    const invalidRows = [];
    let addedCount = 0;

    jsonData.forEach((row, index) => {
      try {
        // Ajout d'un log pour déboguer la ligne en cours d'analyse
        console.log(`Analyse de la ligne ${index + 1} :`, row);

        // Vérification sécurisée des champs obligatoires
        const missingData = requiredHeaders.filter((header) => {
          const value = row[header]; // Récupère la valeur du champ
          return (
            value === undefined || value === null || String(value).trim() === ""
          ); // Vérifie si vide
        });

        if (missingData.length > 0) {
          console.log(
            `Ligne ${index + 2} ignorée. Champs manquants : ${missingData}`
          );
          invalidRows.push({
            row: index + 2,
            missingHeaders: missingData,
          });
          return; // Ignorer cette ligne
        }

        // Vérifie les doublons uniquement pour les champs obligatoires
        const exists = clients.some((client) => client.siren === row.siren);
        if (exists) {
          console.log(
            `Ligne ${index + 2} ignorée. Doublon détecté pour SIREN ${row.siren}`
          );
          invalidRows.push({
            row: index + 2,
            error: `Doublon détecté pour SIREN: ${row.siren}.`,
          });
          return;
        }

        // Ajoute le client
        const client = {
          id: `${new Date().getTime()}_${addedCount}`,
          ...row, // Inclut toutes les données de la ligne
          historique: [], // Historique initialisé à vide
        };

        clients.push(client);
        addedCount++;
      } catch (error) {
        console.error(
          `Erreur lors de l'analyse de la ligne ${index + 1} :`,
          error
        );
        invalidRows.push({
          row: index + 2,
          error: `Erreur inattendue lors du traitement de cette ligne.`,
        });
      }
    });

    writeClients(clients);
    fs.unlinkSync(file.path);

    res.json({
      addedCount,
      invalidRows,
      details: invalidRows.map(
        (row) =>
          `Ligne ${row.row} ignorée. ${
            row.missingHeaders
              ? `Champs manquants : ${row.missingHeaders.join(", ")}`
              : row.error
          }`
      ),
    });
  } catch (error) {
    console.error("Erreur lors de l'importation :", error);
    res
      .status(500)
      .json({ error: "Erreur lors de l'importation des données." });
  } finally {
    if (file && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
  }
});

module.exports = router;
