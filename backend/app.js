const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

// Importation des routes
const authRoutes = require("./routes/authRoutes");
const clientRoutes = require("./routes/clientRoutes");
const userRoutes = require("./routes/userRoutes");
const importClientsRoute = require("./routes/importClients");

const app = express();
const PORT = 3000;

// Middlewares
app.use(express.json()); // Remplace bodyParser.json()
app.use(cors());
app.use(bodyParser.json());

// Middleware pour consigner les requêtes
app.use((req, res, next) => {
  next();
});

// Servir les fichiers statiques (frontend)
app.use(express.static(path.join(__dirname, "../public")));

// Routes API
app.use("/api/auth", authRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/users", userRoutes);
app.use("/api/clients", importClientsRoute);

// Rediriger la route `/` vers `/login.html`
app.get("/", (req, res) => {
  res.redirect("/login.html");
});

// Servir login.html explicitement
app.get("/login.html", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/login.html"));
});

// Gestion des routes inexistantes
app.use((req, res) => {
  res.status(404).json({ error: "La route demandée n'existe pas." });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
