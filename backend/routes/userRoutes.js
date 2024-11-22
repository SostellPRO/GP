const express = require("express");
const fs = require("fs");
const usersFilePath = "./data/users.json";

const router = express.Router();

// Récupérer tous les utilisateurs
router.get("/", (req, res) => {
  const users = JSON.parse(fs.readFileSync(usersFilePath, "utf8"));
  res.json(users);
});

// Ajouter un utilisateur
router.post("/", (req, res) => {
  const { prenom, nom, email, role } = req.body;
  const users = JSON.parse(fs.readFileSync(usersFilePath, "utf8"));

  const id = `${prenom[0]}${users.length + 1}`;
  const newUser = { id, prenom, nom, email, role };

  users.push(newUser);
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
  res.status(201).json(newUser);
});

module.exports = router;
