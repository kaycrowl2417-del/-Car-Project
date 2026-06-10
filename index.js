const animeGrid = document.querySelector("#anime-grid");
const sortSelect = document.querySelector("#sort-select");
const statusMessage = document.querySelector("#status");
const searchInput = document.querySelector("#search-input");
const searchButton = document.querySelector("#search-button");
const menuButton = document.querySelector("#menu-button");
const closeMenuButton = document.querySelector("#close-menu");
const mobileMenu = document.querySelector("#mobile-menu");


let animeList = [];
let searchTerm = "";

async function loadAnime() {
  try {
    const response = await fetch("https://api.jikan.moe/v4/top/anime?limit=12");

    if (!response.ok) {
      throw new Error("Anime API request failed");
    }

    const result = await response.json();
    animeList = result.data.map((anime) => ({
      id: anime.mal_id,
      title: anime.title_english || anime.title,
      year: anime.year || getYearFromDate(anime.aired?.from),
      image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
      score: anime.score,
      episodes: anime.episodes,
      type: anime.type,
      url: anime.url,
    }));

    statusMessage.textContent = "";
    renderAnime();
  } catch (error) {
    animeList = getFallbackAnime();
    statusMessage.textContent =
      "Live API data could not load, so sample anime data is showing instead.";
    renderAnime();
  }
}

function getYearFromDate(dateValue) {
  if (!dateValue) {
    return 0;
  }

  return new Date(dateValue).getFullYear();
}

function getVisibleAnime() {
  const filteredAnime = animeList.filter((anime) =>
    anime.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (sortSelect.value === "az") {
    filteredAnime.sort((a, b) => a.title.localeCompare(b.title));
  }

  if (sortSelect.value === "za") {
    filteredAnime.sort((a, b) => b.title.localeCompare(a.title));
  }

  if (sortSelect.value === "newest") {
    filteredAnime.sort((a, b) => b.year - a.year);
  }

  if (sortSelect.value === "oldest") {
    filteredAnime.sort((a, b) => a.year - b.year);
  }

  return filteredAnime;
}

function renderAnime() {
  const visibleAnime = getVisibleAnime();

  if (!visibleAnime.length) {
    animeGrid.innerHTML = `
      <div class="empty-state flex flex-col align-center">
        <h1>Could not find any matches related to your search.</h1>
        <span>Please change the filter or reset it below.</span>
        <button id="reset-search">Reset filter</button>
      </div>
    `;
    document.querySelector("#reset-search").addEventListener("click", resetSearch);
    return;
  }

  animeGrid.innerHTML = visibleAnime
    .map(
      (anime) => `
        <div class="card-wrapper">
          <article class="card">
            <div class="top">
              <img src="${anime.image}" alt="${anime.title} poster" />
              <a class="view-car" href="${anime.url}" target="_blank" rel="noreferrer">
                <span>More info</span>
                <span class="arrow">-></span>
              </a>
            </div>
            <div class="bot">
              <div class="title">${anime.year || "Year unknown"} ${anime.title}</div>
              <span class="car-info">Episodes: ${anime.episodes || "N/A"}</span>
              <span class="car-info">Type: ${anime.type || "Anime"}</span>
              <span class="car-info">Released: ${anime.year || "Year unknown"}</span>
              <div class="flex justify-between price-row">
                <h2 class="price"><span class="curr">Score ${anime.score || "N/A"}</span></h2>
              </div>
            </div>
          </article>
        </div>
      `
    )
    .join("");
}

function setSearch() {
  searchTerm = searchInput.value.trim();
  renderAnime();
}

function resetSearch() {
  searchInput.value = "";
  searchTerm = "";
  sortSelect.value = "az";
  renderAnime();
}

function openMenu() {
  mobileMenu.classList.add("active");
  mobileMenu.setAttribute("aria-hidden", "false");
  menuButton.setAttribute("aria-expanded", "true");
}

function closeMenu() {
  mobileMenu.classList.remove("active");
  mobileMenu.setAttribute("aria-hidden", "true");
  menuButton.setAttribute("aria-expanded", "false");
}

function getFallbackAnime() {
  return [
    {
      id: 1,
      title: "Fullmetal Alchemist: Brotherhood",
      year: 2009,
      image: "https://cdn.myanimelist.net/images/anime/1208/94745l.jpg",
      score: 9.1,
      episodes: 64,
      type: "TV",
      url: "https://myanimelist.net/anime/5114",
    },
    {
      id: 2,
      title: "Attack on Titan",
      year: 2013,
      image: "https://cdn.myanimelist.net/images/anime/10/47347l.jpg",
      score: 8.6,
      episodes: 25,
      type: "TV",
      url: "https://myanimelist.net/anime/16498",
    },
    {
      id: 3,
      title: "Demon Slayer",
      year: 2019,
      image: "https://cdn.myanimelist.net/images/anime/1286/99889l.jpg",
      score: 8.4,
      episodes: 26,
      type: "TV",
      url: "https://myanimelist.net/anime/38000",
    },
    {
      id: 4,
      title: "Cowboy Bebop",
      year: 1998,
      image: "https://cdn.myanimelist.net/images/anime/4/19644l.jpg",
      score: 8.8,
      episodes: 26,
      type: "TV",
      url: "https://myanimelist.net/anime/1",
    },
  ];
}

sortSelect.addEventListener("change", renderAnime);
menuButton.addEventListener("click", openMenu);
closeMenuButton.addEventListener("click", closeMenu);
mobileMenu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && mobileMenu.classList.contains("active")) {
    closeMenu();
  }
});

searchButton.addEventListener("click", setSearch);
searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    setSearch();
  }
});

loadAnime();
