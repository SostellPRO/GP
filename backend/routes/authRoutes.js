const express = require("express");
const jwt = require("jsonwebtoken");
const users = require("../data/users.json");

const router = express.Router();
const SECRET_KEY = "votre_clé_secrète";

// Route pour l'authentification
router.post("/login", (req, res) => {
  console.log("Requête reçue :", req.body);
  const { email, id } = req.body;
  console.log("Email :", email);
  console.log("ID :", id);
  // Vérifiez si l'email et l'ID sont fournis
  if (!email || !id) {
    return res.status(400).json({ error: "Email et ID utilisateur requis." });
  }

  // Recherche de l'utilisateur
  const user = users.find((u) => u.email === email && u.id === id);
  console.log("Utilisateur trouvé :", user);
  if (!user) {
    return res.status(401).json({ error: "Email ou ID incorrect." });
  }

  // Génération d'un token JWT
  const token = jwt.sign(
    { id: user.id, prenom: user.prenom, nom: user.nom, role: user.role },
    SECRET_KEY,
    { expiresIn: "1h" }
  );

  res.json({ token });
});

module.exports = router;
