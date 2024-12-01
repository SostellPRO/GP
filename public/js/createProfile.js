document.addEventListener("DOMContentLoaded", () => {
  console.log(document.getElementById("profileForm")); // Devrait afficher l'élément ou `null`

  document
    .getElementById("profileForm")

    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const prenom = document.getElementById("prenom").value;
      const nom = document.getElementById("nom").value;
      const email = document.getElementById("email").value;
      const role = document.getElementById("role").value;

      try {
        const response = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prenom, nom, email, role }),
        });

        if (!response.ok) {
          const { error } = await response.json();
          throw new Error(error || "Erreur lors de la création du profil.");
        }

        const { prenom: createdPrenom, nom: createdNom } =
          await response.json();
        document.getElementById("statusMessage").textContent =
          `Profil créé avec succès pour ${createdPrenom} ${createdNom}.`;
        document.getElementById("profileForm").reset();
      } catch (error) {
        document.getElementById("statusMessage").textContent = error.message;
      }
    });
});
function navigateToHome() {
  window.location.href = "/home.html";
}
