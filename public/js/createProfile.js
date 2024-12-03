document.getElementById("profileForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  // Récupération des valeurs des champs du formulaire
  const prenom = document.getElementById("prenom").value.trim();
  const nom = document.getElementById("nom").value.trim();
  const email = document.getElementById("email").value.trim();
  const role = document.getElementById("role").value;

  // Référence au conteneur de message
  const statusMessage = document.getElementById("statusMessage");

  // Réinitialisation du message
  statusMessage.textContent = "";
  statusMessage.className = "status-message";
  statusMessage.style.display = "none";

  try {
    // Envoi de la requête POST
    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prenom, nom, email, role }),
    });

    // Vérification de la réponse
    if (!response.ok) {
      const { error } = await response.json();
      throw new Error(error || "Erreur lors de la création du profil.");
    }

    // Récupération des données de la réponse
    const { prenom: createdPrenom, nom: createdNom } = await response.json();

    // Affichage du message de succès
    statusMessage.textContent = `Succès ! Profil créé pour ${createdPrenom} ${createdNom}.`;
    statusMessage.classList.add("success");
    statusMessage.style.display = "block";

    // Réinitialisation du formulaire
    document.getElementById("profileForm").reset();

    // Masquer le message après 5 secondes
    setTimeout(() => {
      statusMessage.style.display = "none";
    }, 5000);
  } catch (error) {
    // Affichage du message d'erreur
    statusMessage.textContent = error.message;
    statusMessage.classList.add("error");
    statusMessage.style.display = "block";

    // Masquer le message après 5 secondes
    setTimeout(() => {
      statusMessage.style.display = "none";
    }, 5000);
  }
});

// Fonction pour naviguer vers la page d'accueil
function navigateToHome() {
  window.location.href = "/home.html";
}
