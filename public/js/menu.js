document.addEventListener("DOMContentLoaded", () => {
  const menuContainer = document.getElementById("menuContainer");

  // Créer le bouton de menu
  const menuButton = document.createElement("button");
  menuButton.id = "menuButton";
  menuButton.textContent = "MENU";
  menuContainer.appendChild(menuButton);

  // Créer le menu déroulant
  const menuDropdown = document.createElement("div");
  menuDropdown.id = "menuDropdown";
  menuDropdown.className = "menu-dropdown";
  menuContainer.appendChild(menuDropdown);

  // Pages disponibles
  const menuItems = [
    { text: "Accueil", href: "home.html" },
    { text: "Agenda", href: "agenda.html" },
    { text: "Créer un Client", href: "createClient.html" },
  ];

  // Ajouter les liens au menu
  menuItems.forEach((item) => {
    const anchor = document.createElement("a");
    anchor.textContent = item.text;
    anchor.href = item.href;
    menuDropdown.appendChild(anchor);
  });

  // Gestion du clic sur le bouton du menu
  menuButton.addEventListener("click", () => {
    menuDropdown.classList.toggle("open");
  });

  // Fermer le menu en cliquant à l'extérieur
  document.addEventListener("click", (event) => {
    if (
      !menuButton.contains(event.target) &&
      !menuDropdown.contains(event.target)
    ) {
      menuDropdown.classList.remove("open");
    }
  });

  // Fonctionnalité pour cacher/montrer le bouton menu en fonction du défilement
  window.addEventListener("scroll", () => {
    const scrollPosition = window.scrollY;
    const pageHeight =
      document.documentElement.scrollHeight - window.innerHeight;

    // Cache le menu si on a défilé de plus de 10% de la page
    if (scrollPosition / pageHeight > 0.1) {
      menuButton.style.display = "none";
    }

    // Montre le menu si on est à moins de 90% de la page
    if (scrollPosition / pageHeight < 0.9) {
      menuButton.style.display = "block";
    }
  });
});
