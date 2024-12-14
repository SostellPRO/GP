const express = require("express");
const fs = require("fs");
const path = require("path");

const clientsFilePath = path.join(__dirname, "../data/clients.json");
const router = express.Router();

// Fonction pour lire les clients
const readClients = () => {
  try {
    const data = fs.readFileSync(clientsFilePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Erreur lors de la lecture des clients :", error);
    throw new Error("Erreur lors de la lecture des clients.");
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

// Route : Récupérer tous les clients ou appliquer des filtres
router.get("/", (req, res) => {
  try {
    const clients = readClients();
    let {
      typologie,
      dateAvant,
      dateApres,
      statut,
      matriculeGestionnaire,
      nombreDossiers,
      montantEstime,
    } = req.query;

    let filteredClients = clients;

    // Filtrer par typologie
    if (typologie && typologie !== "Tous") {
      filteredClients = filteredClients.filter(
        (client) => client.typologie === typologie
      );
    }

    // Filtrer par dateAvant
    if (dateAvant) {
      filteredClients = filteredClients.filter(
        (client) => new Date(client.dateProchaineAction) <= new Date(dateAvant)
      );
    }

    // Filtrer par dateApres
    if (dateApres) {
      filteredClients = filteredClients.filter(
        (client) => new Date(client.dateProchaineAction) >= new Date(dateApres)
      );
    }

    // Filtrer par statut
    if (statut && statut !== "Tous") {
      filteredClients = filteredClients.filter(
        (client) => client.statut === statut
      );
    }

    // Filtrer par matriculeGestionnaire
    if (matriculeGestionnaire && matriculeGestionnaire !== "Tous") {
      filteredClients = filteredClients.filter(
        (client) => client.matriculeGestionnaire === matriculeGestionnaire
      );
    }

    // Filtrer par nombre de dossiers
    if (nombreDossiers && nombreDossiers !== "Tous") {
      const dossierLimit = parseInt(nombreDossiers.replace(/[<+>]/g, ""), 10);
      if (nombreDossiers.startsWith("<")) {
        filteredClients = filteredClients.filter(
          (client) => parseInt(client.nombreDossiers) < dossierLimit
        );
      } else if (nombreDossiers.startsWith("+")) {
        filteredClients = filteredClients.filter(
          (client) => parseInt(client.nombreDossiers) > dossierLimit
        );
      }
    }

    // Filtrer par montant estimé
    if (montantEstime && montantEstime !== "Tous") {
      const montantLimit = parseInt(montantEstime.replace(/[<+>€]/g, ""), 10);
      if (montantEstime.startsWith("<")) {
        filteredClients = filteredClients.filter(
          (client) =>
            parseInt(client.montantEstime.replace(/[<+>€]/g, "")) < montantLimit
        );
      } else if (montantEstime.startsWith("+")) {
        filteredClients = filteredClients.filter(
          (client) =>
            parseInt(client.montantEstime.replace(/[<+>€]/g, "")) > montantLimit
        );
      }
    }

    res.json(filteredClients);
  } catch (error) {
    console.error("Erreur lors de la récupération des clients :", error);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
});

// Route : Ajouter un nouveau client
router.post("/", (req, res) => {
  try {
    const client = req.body;
    const clients = readClients();

    // Validation des données
    if (!client.raisonSociale || !client.secteurActivite || !client.siren) {
      return res.status(400).json({
        error:
          "Les champs 'raisonSociale', 'secteurActivite' et 'siren' sont requis.",
      });
    }

    // Générer un ID unique
    const id = `${new Date().toISOString().replace(/[-:.TZ]/g, "")}${clients.length + 1}`;
    const newClient = {
      id,
      ...client,
      historique: client.historique || [],
      statut: client.statut || "En attente d'appel",
    };

    clients.push(newClient);
    writeClients(clients);

    res.status(201).json(newClient);
  } catch (error) {
    console.error("Erreur lors de l'ajout d'un client :", error);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
});

// Route : Récupérer un client par ID
router.get("/:id", (req, res) => {
  try {
    const { id } = req.params;
    const clients = readClients();
    const client = clients.find((client) => client.id === id);

    if (!client) {
      return res.status(404).json({ error: "Client non trouvé." });
    }

    res.json(client);
  } catch (error) {
    console.error("Erreur lors de la récupération d'un client :", error);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
});

// Route : Mettre à jour un client
router.put("/:id", (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    const clients = readClients();
    const clientIndex = clients.findIndex((client) => client.id === id);

    if (clientIndex === -1) {
      return res.status(404).json({ error: "Client non trouvé." });
    }

    const existingClient = clients[clientIndex];

    // Mise à jour des champs
    clients[clientIndex] = {
      ...existingClient,
      ...updatedData,
    };

    writeClients(clients);

    res.sendStatus(204);
  } catch (error) {
    console.error("Erreur lors de la mise à jour d'un client :", error);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
});

// Route : Ajouter un commentaire à l'historique
router.patch("/:id/historique", (req, res) => {
  try {
    const { id } = req.params;
    const { commentaire } = req.body;
    const clients = readClients();
    const clientIndex = clients.findIndex((client) => client.id === id);

    if (clientIndex === -1) {
      return res.status(404).json({ error: "Client non trouvé." });
    }

    const client = clients[clientIndex];

    if (!commentaire) {
      return res
        .status(400)
        .json({ error: "Le champ 'commentaire' est requis." });
    }

    const timestamp = new Date().toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    const fullComment = `[${timestamp}] ${commentaire}`;
    client.historique = [fullComment, ...(client.historique || [])];

    writeClients(clients);

    res.status(200).json(client);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'historique :", error);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
});

// Route : Supprimer un client
router.delete("/:id", (req, res) => {
  try {
    const { id } = req.params;
    const clients = readClients();
    const updatedClients = clients.filter((client) => client.id !== id);

    if (clients.length === updatedClients.length) {
      return res.status(404).json({ error: "Client non trouvé." });
    }

    writeClients(updatedClients);
    res.sendStatus(204);
  } catch (error) {
    console.error("Erreur lors de la suppression d'un client :", error);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
});

module.exports = router;
