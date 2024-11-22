const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

// Importation des routes
const authRoutes = require("./routes/authRoutes");
const clientRoutes = require("./routes/clientRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();
const PORT = 3000;

// Middlewares
app.use(bodyParser.json());
app.use(cors());

// Servir les fichiers statiques (frontend)
app.use(express.static(path.join(__dirname, "../public")));

// Routes API
app.use("/api/auth", authRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/users", userRoutes);

// Gestion des routes inexistantes
app.use((req, res) => {
  res.status(404).json({ error: "La route demandée n'existe pas." });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
