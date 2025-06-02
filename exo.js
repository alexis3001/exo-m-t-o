const API_KEY = "ae7bfea9e7084636c48ff46874a3b28e";

document.getElementById("menu-toggle").addEventListener("click", function () {
  document.getElementById("menu").classList.toggle("open");
});

function getIconUrl(iconCode) {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}

function afficherMeteoParCoordonnees(lat, lon) {
  fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=fr&appid=${API_KEY}`)
    .then(res => res.json())
    .then(data => {
      if (data.cod !== "200") {
        alert("Données météo introuvables !");
        return;
      }

      const now = data.list[0];

      document.getElementById("ville-affichee").textContent = data.city.name;
      document.getElementById("description-actuelle").textContent = now.weather[0].description;
      document.getElementById("icone-actuelle").src = getIconUrl(now.weather[0].icon);
      document.getElementById("icone-actuelle").alt = now.weather[0].description;
      document.getElementById("temp-min").textContent = Math.round(now.main.temp_min) + "°C";
      document.getElementById("temp-max").textContent = Math.round(now.main.temp_max) + "°C";

      const getPeriod = (hour) => data.list.find(item => item.dt_txt.includes(`${hour}:00:00`));

      const matin = getPeriod("06");
      const apresmidi = getPeriod("12");
      const soir = getPeriod("18");
      const nuit = getPeriod("00");

      if (matin) {
        document.getElementById("temp-matin").textContent = Math.round(matin.main.temp) + "°C";
        document.getElementById("icone-matin").src = getIconUrl(matin.weather[0].icon);
        document.getElementById("icone-matin").alt = matin.weather[0].description;
      }
      if (apresmidi) {
        document.getElementById("temp-apresmidi").textContent = Math.round(apresmidi.main.temp) + "°C";
        document.getElementById("icone-apresmidi").src = getIconUrl(apresmidi.weather[0].icon);
        document.getElementById("icone-apresmidi").alt = apresmidi.weather[0].description;
      }
      if (soir) {
        document.getElementById("temp-soir").textContent = Math.round(soir.main.temp) + "°C";
        document.getElementById("icone-soir").src = getIconUrl(soir.weather[0].icon);
        document.getElementById("icone-soir").alt = soir.weather[0].description;
      }
      if (nuit) {
        document.getElementById("temp-nuit").textContent = Math.round(nuit.main.temp) + "°C";
        document.getElementById("icone-nuit").src = getIconUrl(nuit.weather[0].icon);
        document.getElementById("icone-nuit").alt = nuit.weather[0].description;
      }
    })
    .catch(err => console.error("Erreur météo (coordonnées) :", err));
}

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("ville");

  // Créer la boîte de suggestions
  const suggestions = document.createElement("ul");
  suggestions.id = "suggestions";
  suggestions.style.position = "absolute";
  suggestions.style.backgroundColor = "#fff";
  suggestions.style.border = "1px solid #ccc";
  suggestions.style.listStyle = "none";
  suggestions.style.padding = "0";
  suggestions.style.marginTop = "5px";
  suggestions.style.width = input.offsetWidth + "px";
  suggestions.style.zIndex = "1000";
  suggestions.style.maxHeight = "200px";
  suggestions.style.overflowY = "auto";
  suggestions.style.boxShadow = "0px 2px 5px rgba(0,0,0,0.2)";
  input.parentNode.style.position = "relative"; // Positionner par rapport au parent
  input.parentNode.appendChild(suggestions);

  function afficherSuggestions(valeur) {
    suggestions.innerHTML = "";

    if (valeur.length < 3) return;

    fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${valeur}&limit=5&appid=${API_KEY}`)
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) return;


        data 
        .filter(ville => {
          const nomComplet =`${ville.name}${ville.state ? ', ' + ville.state : ''}, ${ville.country}`;
          const li = document.createElement("li");
          li.textContent = nomComplet;
          li.style.padding = "8px";
          li.style.cursor = "pointer";
          li.addEventListener("click", () => {
            input.value = nomComplet;
            suggestions.innerHTML = "";
            afficherMeteoParCoordonnees(ville.lat, ville.lon);
          });
          suggestions.appendChild(li);
        });
      })
      .catch(err => console.error("Erreur autocomplétion :", err));
  }

  if (input) {
    input.addEventListener("input", () => {
      afficherSuggestions(input.value.trim());
    });

    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        const ville = input.value.trim();
        if (ville !== "") {
          // Dernier recours : si l'utilisateur tape manuellement une ville, on tente de la géocoder
          fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${ville}&limit=1&appid=${API_KEY}`)
            .then(res => res.json())
            .then(data => {
              if (data.length > 0) {
                const { lat, lon } = data[0];
                afficherMeteoParCoordonnees(lat, lon);
              } else {
                alert("Ville non trouvée !");
              }
            });
        }
      }
    });
  } else {
    console.error("Champ de recherche introuvable !");
  }

  // Paris au chargement
  afficherMeteoParCoordonnees(48.8566, 2.3522);
});
