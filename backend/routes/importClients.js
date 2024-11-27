const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const xlsx = require("xlsx");
const csvParser = require("csv-parser");

const router = express.Router();
const clientsFilePath = path.join(__dirname, "../data/clients.json");

// Configuration de multer pour gérer les fichiers téléchargés
const upload = multer({
  dest: "uploads/",
});

// Fonction pour lire les clients existants
const readClients = () => {
  try {
    const data = fs.readFileSync(clientsFilePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Erreur lors de la lecture des clients :", error);
    return [];
  }
};

// Fonction pour écrire dans le fichier des clients
const writeClients = (clients) => {
  try {
    fs.writeFileSync(clientsFilePath, JSON.stringify(clients, null, 2));
  } catch (error) {
    console.error("Erreur lors de l'écriture des clients :", error);
    throw new Error("Erreur lors de l'écriture des clients.");
  }
};

// Fonction pour traiter un fichier CSV
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

// Route : Importer un fichier (Excel ou CSV)
router.post("/import", upload.single("campaignFile"), async (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "Aucun fichier fourni." });
  }

  try {
    const extension = path.extname(file.originalname).toLowerCase();
    let jsonData = [];

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
        .json({ error: "Seuls les fichiers Excel ou CSV sont supportés." });
    }

    const clients = readClients();

    const requiredHeaders = [
      "raisonSociale",
      "secteurActivite",
      "siren",
      "siret",
      "typologie",
      "civilite1",
      "nomInterlocuteur",
      "prenomInterlocuteur1",
      "adressePostale",
      "complementAdresse",
      "codePostal",
      "telephone1",
      "telephone2",
      "mail1",
      "mail2",
      "commentaire",
      "dateProchaineAction",
      "statut",
      "matriculeGestionnaire",
    ];

    const invalidRows = [];
    let addedCount = 0;

    jsonData.forEach((row, index) => {
      const missingHeaders = requiredHeaders.filter(
        (header) => !(header in row)
      );

      if (missingHeaders.length > 0) {
        invalidRows.push({
          row: index + 2,
          missingHeaders,
        });
        return;
      }

      const id = `${new Date()
        .toISOString()
        .replace(/[-:.TZ]/g, "")}${clients.length + addedCount + 1}`;
      const dateProchaineAction = row.dateProchaineAction
        ? new Date(row.dateProchaineAction).toISOString().split("T")[0]
        : null;

      const client = {
        id,
        raisonSociale: row.raisonSociale,
        secteurActivite: row.secteurActivite,
        siren: row.siren,
        siret: row.siret,
        typologie: row.typologie,
        civilite1: row.civilite1,
        nomInterlocuteur: row.nomInterlocuteur,
        prenomInterlocuteur1: row.prenomInterlocuteur1,
        adressePostale: row.adressePostale,
        complementAdresse: row.complementAdresse,
        codePostal: row.codePostal,
        telephone1: row.telephone1,
        telephone2: row.telephone2,
        mail1: row.mail1,
        mail2: row.mail2,
        commentaire: row.commentaire,
        dateProchaineAction,
        statut: row.statut || "En attente d'appel",
        matriculeGestionnaire: row.matriculeGestionnaire,
        historique: [],
      };

      clients.push(client);
      addedCount++;
    });

    writeClients(clients);

    fs.unlinkSync(file.path);

    res.json({
      message: "Importation terminée.",
      addedCount,
      invalidRows,
    });
  } catch (error) {
    console.error("Erreur lors de l'importation :", error);
    res
      .status(500)
      .json({ error: "Erreur lors de l'importation des données." });
  }
});

module.exports = router;
