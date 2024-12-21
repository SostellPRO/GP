// Écouteur d'événement pour le formulaire de connexion
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  // Récupère les valeurs des champs
  const email = document.getElementById("email").value.trim();
  const id = document.getElementById("id").value.trim();

  try {
    // Envoie une requête POST au backend pour tenter la connexion
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, id }),
    });

    // Vérifie si la réponse est valide
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Connexion échouée.");
    }

    // Récupère les données de la réponse
    const data = await response.json();

    // Stocke le token dans le localStorage
    localStorage.setItem("token", data.token);

    // Décodage du token pour afficher des informations si nécessaire
    const userInfo = parseJwt(data.token);

    // Redirige vers la page d'accueil
    window.location.href = "/home.html";
  } catch (error) {
    console.error("Erreur lors de la connexion :", error);
    document.getElementById("errorMessage").textContent =
      error.message || "Une erreur inconnue s'est produite.";
  }
});

// Fonction pour décoder un token JWT
function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch (error) {
    console.error("Erreur lors du décodage du token :", error);
    return null;
  }
}
