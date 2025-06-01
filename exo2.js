const API_KEY = "ae7bfea9e7084636c48ff46874a3b28e";

    function getIconUrl(iconCode) {
      return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    }

    function afficherPrevisions(ville) {
      fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${ville}&units=metric&lang=fr&appid=${API_KEY}`)
        .then(res => res.json())
        .then(data => {
          const container = document.getElementById("previsions-container");
          container.innerHTML = "";

          const jours = {};

          data.list.forEach(item => {
            const date = item.dt_txt.split(" ")[0];
            if (!jours[date]) jours[date] = [];
            jours[date].push(item);
          });

          Object.keys(jours).slice(0, 5).forEach(date => {
            const dayData = jours[date];
            const moyenneTemp = dayData.reduce((acc, item) => acc + item.main.temp, 0) / dayData.length;
            const icone = dayData[0].weather[0].icon;
            const description = dayData[0].weather[0].description;

            const dayBlock = document.createElement("div");
            dayBlock.classList.add("day-card");

            dayBlock.innerHTML = `
              <h3>${new Date(date).toLocaleDateString("fr-FR", { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
              <img src="${getIconUrl(icone)}" alt="${description}" />
              <p>${description}</p>
              <p><strong>${Math.round(moyenneTemp)}°C</strong></p>
            `;

            container.appendChild(dayBlock);
          });
        })
        .catch(err => {
          console.error("Erreur lors du chargement des prévisions :", err);
        });
    }

    document.getElementById("menu-toggle").addEventListener("click", function () {
    document.getElementById("menu").classList.toggle("open");
  });


    document.addEventListener("DOMContentLoaded", () => {
      afficherPrevisions("Paris");

      const input = document.getElementById("ville");
      input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          const ville = e.target.value.trim();
          if (ville !== "") {
            afficherPrevisions(ville);
          }
        }
      });
    });