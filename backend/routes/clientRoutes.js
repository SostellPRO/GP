const express = require("express");
const fs = require("fs");
const clientsFilePath = "./data/clients.json";

const router = express.Router();

// Récupérer tous les clients
router.get("/", (req, res) => {
  const clients = JSON.parse(fs.readFileSync(clientsFilePath, "utf8"));
  res.json(clients);
});

// Ajouter un nouveau client
router.post("/", (req, res) => {
  const client = req.body;
  const clients = JSON.parse(fs.readFileSync(clientsFilePath, "utf8"));

  const id = `${new Date().toISOString().replace(/[-:.TZ]/g, "")}${clients.length + 1}`;
  const newClient = { id, ...client };

  clients.push(newClient);
  fs.writeFileSync(clientsFilePath, JSON.stringify(clients, null, 2));
  res.status(201).json(newClient);
});

module.exports = router;
