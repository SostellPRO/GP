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

// Récupérer tous les clients ou filtrer par statut
router.get("/", (req, res) => {
  try {
    const { status } = req.query; // Paramètre de requête pour filtrer par statut
    const clients = readClients();

    if (status) {
      const filteredClients = clients.filter(
        (client) => client.statut.toLowerCase() === status.toLowerCase()
      );
      return res.json(filteredClients);
    }

    res.json(clients);
  } catch (error) {
    console.error("Erreur lors de la récupération des clients :", error);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
});

// Ajouter un nouveau client
router.post("/", (req, res) => {
  try {
    const client = req.body;
    const clients = readClients();

    // Valider les données du client
    if (!client.raisonSociale || !client.secteurActivite || !client.siren) {
      return res.status(400).json({
        error:
          "Les champs 'raisonSociale', 'secteurActivite' et 'siren' sont requis.",
      });
    }

    // Générer un ID unique pour le client
    const id = `${new Date().toISOString().replace(/[-:.TZ]/g, "")}${
      clients.length + 1
    }`;
    const newClient = { id, ...client };

    clients.push(newClient);
    writeClients(clients);

    res.status(201).json(newClient);
  } catch (error) {
    console.error("Erreur lors de l'ajout d'un client :", error);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
});

// Récupérer un client par ID
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

// Mettre à jour un client
router.put("/:id", (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    const clients = readClients();
    const clientIndex = clients.findIndex((client) => client.id === id);

    if (clientIndex === -1) {
      return res.status(404).json({ error: "Client non trouvé." });
    }

    // Mettre à jour les données du client
    clients[clientIndex] = { ...clients[clientIndex], ...updatedData };
    writeClients(clients);

    res.json(clients[clientIndex]);
  } catch (error) {
    console.error("Erreur lors de la mise à jour d'un client :", error);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
});

// Supprimer un client
router.delete("/:id", (req, res) => {
  try {
    const { id } = req.params;
    const clients = readClients();
    const filteredClients = clients.filter((client) => client.id !== id);

    if (clients.length === filteredClients.length) {
      return res.status(404).json({ error: "Client non trouvé." });
    }

    writeClients(filteredClients);
    res.status(200).json({ message: "Client supprimé avec succès." });
  } catch (error) {
    console.error("Erreur lors de la suppression d'un client :", error);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
});

module.exports = router;
