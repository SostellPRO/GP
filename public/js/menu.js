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

    { text: "Extraction", href: "extraction.html" },

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

  // Gestion du scroll pour afficher/masquer le bouton menu
  let lastScrollPosition = 0;

  window.addEventListener("scroll", () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const documentHeight = document.documentElement.scrollHeight;
    const windowHeight = window.innerHeight;

    // Calcul du pourcentage de défilement
    const scrollPercent = (scrollTop / (documentHeight - windowHeight)) * 100;

    if (scrollPercent > 2 && scrollTop > lastScrollPosition) {
      // Masquer le bouton menu si on descend et dépasse 2% de la page
      menuButton.classList.add("hidden");
    } else if (scrollPercent < 4 && scrollTop < lastScrollPosition) {
      // Réafficher le bouton menu si on remonte en restant sous 98%
      menuButton.classList.remove("hidden");
    }

    lastScrollPosition = scrollTop;
  });
});
