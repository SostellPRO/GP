document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Veuillez vous connecter.");
    window.location.href = "/login.html";
    return;
  }

  const userInfo = parseJwt(token);

  if (userInfo) {
    document.getElementById("user-id").textContent = userInfo.id;
    document.getElementById("user-name").textContent =
      `${userInfo.prenom} ${userInfo.nom}`;

    const navLinks = document.getElementById("navigation-links");

    // Liens selon le rôle de l'utilisateur
    navLinks.innerHTML += `<li><a href="agenda.html">AGENDA</a></li>`;
    navLinks.innerHTML += `<li><a href="createClient.html">CREER UN CLIENT</a></li>`;

    if (["Superviseur", "Administrateur"].includes(userInfo.role)) {
      navLinks.innerHTML += `<li><a href="manageCampaigns.html">GERER LES CAMPAGNES</a></li>`;
    }
    if (userInfo.role === "Administrateur") {
      navLinks.innerHTML += `<li><a href="createProfile.html">CREER UN UTILISATEUR</a></li>`;
    }
  } else {
    alert("Erreur d'authentification. Veuillez vous reconnecter.");
    window.location.href = "/login.html";
  }
});

// Fonction pour décoder un JWT
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

// Gestion de la déconnexion
document.getElementById("logoutButton").addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "/login.html";
});
