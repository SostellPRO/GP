const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const xlsx = require("xlsx");

const router = express.Router();

const clientsFilePath = path.join(__dirname, "../data/clients.json");

// Configuration de multer pour gérer les fichiers téléchargés
const upload = multer({
  dest: "uploads/", // Dossier temporaire pour les fichiers
});

// Fonction pour lire les clients existants
const readClients = () => {
  try {
    const data = fs.readFileSync(clientsFilePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Erreur lors de la lecture des clients :", error);
    throw new Error("Erreur lors de la lecture des clients.");
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

// Route pour importer un fichier Excel
router.post("/import", upload.single("campaignFile"), (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "Aucun fichier fourni." });
  }

  try {
    const workbook = xlsx.readFile(file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    // Vérifier que les en-têtes correspondent aux champs requis
    const headers = jsonData[0];
    const requiredHeaders = [
      "id",
      "raisonSociale",
      "secteurActivite",
      "siren",
      "siret",
      "typologie",
      "civilite",
      "nomInterlocuteur",
      "prenomInterlocuteur",
      "telephone1",
      "telephone2",
      "mail1",
      "mail2",
      "adressePostale",
      "complementAdresse",
      "codePostal",
      "nombreDossiers",
      "montantEstime",
      "statut",
      "dateProchaineAction",
      "matriculeGestionnaire",
    ];

    const missingHeaders = requiredHeaders.filter(
      (header) => !headers.includes(header)
    );
    if (missingHeaders.length > 0) {
      return res.status(400).json({
        error: `Les colonnes suivantes sont manquantes : ${missingHeaders.join(", ")}`,
      });
    }

    const clients = readClients();
    const now = new Date();

    // Ajouter les clients du fichier
    jsonData.slice(1).forEach((row, index) => {
      const clientData = Object.fromEntries(
        headers.map((header, idx) => [header, row[idx]])
      );

      // Générer l'ID automatiquement si non fourni
      if (!clientData.id) {
        clientData.id = `${now
          .toISOString()
          .slice(2, 19)
          .replace(
            /[-:T]/g,
            ""
          )}${(clients.length + index + 1).toString().padStart(3, "0")}`;
      }

      // Ajouter des valeurs par défaut ou convertir les champs
      clientData.dateStatut = clientData.dateStatut || now.toISOString();
      clientData.historique = [];
      clients.push(clientData);
    });

    writeClients(clients);

    // Supprimer le fichier temporaire
    fs.unlinkSync(file.path);

    res.json({ message: "Importation réussie", count: jsonData.length - 1 });
  } catch (error) {
    console.error("Erreur lors de l'importation :", error);
    res
      .status(500)
      .json({ error: "Erreur lors de l'importation des données." });
  }
});

module.exports = router;
