const express = require("express");
const fs = require("fs");
const path = require("path");

const usersFilePath = path.join(__dirname, "../data/users.json");
const router = express.Router();

// Fonction pour lire les utilisateurs
const readUsers = () => {
  try {
    const data = fs.readFileSync(usersFilePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Erreur lors de la lecture des utilisateurs :", error);
    throw new Error("Erreur lors de la lecture des utilisateurs.");
  }
};

// Fonction pour écrire les utilisateurs
const writeUsers = (users) => {
  try {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error("Erreur lors de l'écriture des utilisateurs :", error);
    throw new Error("Erreur lors de l'écriture des utilisateurs.");
  }
};

// Récupérer tous les utilisateurs
router.get("/", (req, res) => {
  try {
    const users = readUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
});

// Ajouter un utilisateur
router.post("/", (req, res) => {
  try {
    const { prenom, nom, email, role } = req.body;

    if (!prenom || !nom || !email || !role) {
      return res.status(400).json({
        error: "Les champs 'prenom', 'nom', 'email' et 'role' sont requis.",
      });
    }

    const users = readUsers();

    const id = `${prenom[0]}${users.length + 1}`;
    const newUser = { id, prenom, nom, email, role };

    users.push(newUser);
    writeUsers(users);

    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
});

module.exports = router;
