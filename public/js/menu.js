document.addEventListener("DOMContentLoaded", () => {
  const menuContainer = document.getElementById("menuContainer");

  // Créer le bouton de menu
  const menuButton = document.createElement("button");
  menuButton.id = "menuButton";
  menuButton.textContent = "Menu";
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
});
