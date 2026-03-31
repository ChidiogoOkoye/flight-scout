let currentView = "cards";
let cachedData = []; 

// Theme Handling
function toggleDarkMode() {
  const html = document.documentElement;
  html.classList.toggle("dark");
  const isDark = html.classList.contains("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");
  updateThemeIcon(isDark);
}

function updateThemeIcon(isDark) {
    const icon = document.getElementById("themeIcon");
    if (isDark) {
        icon.innerHTML = '<path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>';
    } else {
        icon.innerHTML = '<path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" fill-rule="evenodd" clip-rule="evenodd"></path>';
    }
}

(function loadTheme() {
  const saved = localStorage.getItem("theme");
  const isDark = saved !== "light";
  if (isDark) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    updateThemeIcon(isDark);
    loadRecentSearches();
    loadDeals(); // Load default deals
  });
})();

// Data Fetching
async function loadDeals() {
    showSkeletons();
    document.getElementById("resultsTitle").innerText = "Featured Deals";
    
    try {
        const res = await fetch("/deals");
        const data = await res.json();
        // The /deals endpoint returns an array directly, or object with data
        cachedData = data.data || data; 
        renderData();
    } catch (e) {
        showError("Failed to load deals. Please try again later.");
    }
}

async function searchFlights() {
  const city = document.getElementById("cityInput").value.trim().toUpperCase();
  if (!city) return;

  saveSearch(city);
  showSkeletons();
  document.getElementById("resultsTitle").innerText = `Results for ${city}`;

  try {
      const res = await fetch(`/search?city=${city}`);
      const data = await res.json();
    
      if (data.status === "no_results") {
        showNoResults(data);
      } else if (data.status === "success" && data.data) {
        cachedData = data.data;
        renderData();
      } else {
        showError(data.error || "An error occurred fetching results.");
      }
  } catch (e) {
      showError("Search failed. Please try again.");
  }
}

function quickSearch(city) {
  document.getElementById("cityInput").value = city;
  searchFlights();
}

function saveSearch(city) {
  let searches = JSON.parse(localStorage.getItem("searches")) || [];
  if (!searches.includes(city)) {
    searches.unshift(city);
  }
  searches = searches.slice(0, 5); // keep last 5
  localStorage.setItem("searches", JSON.stringify(searches));
  loadRecentSearches();
}

function loadRecentSearches() {
  const container = document.getElementById("recentSearches");
  const searches = JSON.parse(localStorage.getItem("searches")) || [];
  
  if (searches.length === 0) {
      container.innerHTML = '<span class="text-gray-500 italic">None</span>';
      return;
  }

  container.innerHTML = searches.map(city => `
    <button onclick="quickSearch('${city}')"
      class="glass-panel px-3 py-1.5 rounded-full hover:scale-105 transition-transform duration-200">
      ${city}
    </button>
  `).join("");
}

// Rendering
function toggleView() {
  currentView = currentView === "cards" ? "table" : "cards";
  document.getElementById("switchViewBtn").innerText = currentView === "cards" ? "Switch to Table View" : "Switch to Cards View";
  renderData();
}

function renderData() {
    if (!cachedData || cachedData.length === 0) {
        showNoResults({ city: "your destination", suggestions: ["PAR", "LON", "BER"] });
        return;
    }
    
    if (currentView === "cards") {
        renderCards(cachedData);
    } else {
        renderTable(cachedData);
    }
}

function renderCards(deals) {
  const container = document.getElementById("results");
  container.className = "grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto";
  container.innerHTML = "";

  deals.forEach((deal, index) => {
    const depDate = new Date(deal.departure).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' });
    const retDate = deal.return ? new Date(deal.return).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' }) : '';

    const card = `
      <div class="glass-panel p-6 rounded-3xl flex flex-col h-full transform transition duration-300 hover:-translate-y-2 hover:shadow-2xl opacity-0 animate-fade-in group" style="animation-delay: ${index * 100}ms">
        <div class="flex justify-between items-start mb-4">
            <h2 class="text-2xl font-extrabold tracking-tight">${deal.city || 'Destination'}</h2>
            <div class="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 font-bold px-3 py-1 rounded-full text-lg shadow-sm border border-blue-200 dark:border-blue-800/50">
                £${deal.price}
            </div>
        </div>
        
        <div class="flex-grow space-y-3 mb-6">
            <div class="flex items-center text-gray-700 dark:text-gray-300">
                <span class="mr-2 text-xl">✈️</span> <span class="font-semibold">${deal.airline || 'Various Airlines'}</span>
            </div>
            <div class="flex items-start text-sm text-gray-600 dark:text-gray-400">
                <div class="w-16 font-semibold uppercase text-xs tracking-wider pt-0.5">Out:</div>
                <div class="font-medium">${depDate}</div>
            </div>
            ${retDate ? `
            <div class="flex items-start text-sm text-gray-600 dark:text-gray-400">
                <div class="w-16 font-semibold uppercase text-xs tracking-wider pt-0.5">Back:</div>
                <div class="font-medium">${retDate}</div>
            </div>
            ` : ''}
        </div>

        <a href="${deal.link || '#'}" target="_blank"
          class="mt-auto block w-full bg-blue-600 hover:bg-blue-500 text-white text-center py-3 rounded-xl font-semibold transition-colors duration-200">
          View Deal
        </a>
      </div>
    `;
    container.innerHTML += card;
  });
}

function renderTable(deals) {
  const container = document.getElementById("results");
  container.className = "max-w-5xl mx-auto w-full"; 
  
  let rows = deals.map((d, index) => {
    const depDate = new Date(d.departure).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    return `
    <tr class="border-b border-gray-200 dark:border-gray-700 hover:bg-white/30 dark:hover:bg-gray-800/50 transition-colors opacity-0 animate-fade-in" style="animation-delay: ${index * 50}ms">
      <td class="p-4 font-semibold">${d.city}</td>
      <td class="p-4 text-blue-600 dark:text-blue-400 font-bold">£${d.price}</td>
      <td class="p-4">${d.airline || '-'}</td>
      <td class="p-4">${depDate}</td>
      <td class="p-4 text-right">
        <a href="${d.link || '#'}" target="_blank" class="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
          View
        </a>
      </td>
    </tr>
  `}).join("");

  container.innerHTML = `
    <div class="glass-panel rounded-3xl overflow-hidden shadow-lg animate-fade-in">
        <table class="w-full text-left border-collapse">
        <thead class="bg-white/40 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700 backdrop-blur-md">
            <tr>
            <th class="p-4 font-semibold text-gray-600 dark:text-gray-300">City</th>
            <th class="p-4 font-semibold text-gray-600 dark:text-gray-300">Price</th>
            <th class="p-4 font-semibold text-gray-600 dark:text-gray-300">Airline</th>
            <th class="p-4 font-semibold text-gray-600 dark:text-gray-300">Date</th>
            <th class="p-4 text-right"></th>
            </tr>
        </thead>
        <tbody>
            ${rows}
        </tbody>
        </table>
    </div>
  `;
}

function showNoResults(data) {
  const container = document.getElementById("results");
  container.className = "max-w-3xl mx-auto w-full";

  const suggestionsHTML = data.suggestions.map(city => `
    <button 
      onclick="quickSearch('${city}')"
      class="glass-panel px-5 py-2.5 rounded-full font-semibold hover:scale-105 transition-transform"
    >
      ${city}
    </button>
  `).join("");

  container.innerHTML = `
    <div class="glass-panel p-10 rounded-3xl text-center shadow-lg w-full animate-fade-in">
      <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
        No flights found for "${data.city || 'your search'}"
      </h2>
      <p class="text-gray-600 dark:text-gray-400 mb-8">
        Try one of these nearby destinations instead:
      </p>
      <div class="flex flex-wrap justify-center gap-4">
        ${suggestionsHTML}
      </div>
    </div>
  `;
}

function showError(msg) {
    const container = document.getElementById("results");
    container.className = "max-w-3xl mx-auto w-full";
    container.innerHTML = `
      <div class="glass-panel p-8 rounded-3xl text-center border-red-500/50 animate-fade-in">
        <h2 class="text-2xl font-bold text-red-500 mb-2">Oops!</h2>
        <p class="text-gray-600 dark:text-gray-400 mb-6">${msg}</p>
        <button onclick="loadDeals()" class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors duration-200">Try Reloading Deals</button>
      </div>
    `;
}

function showSkeletons() {
  const container = document.getElementById("results");
  container.className = "grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto";

  let skeletons = "";
  for (let i = 0; i < 6; i++) {
    skeletons += `
      <div class="glass-panel p-6 rounded-3xl flex flex-col h-full animate-pulse border-white/20 dark:border-gray-700/50">
        <div class="flex justify-between items-start mb-6">
            <div class="h-8 bg-gray-300 dark:bg-gray-700/60 rounded-lg w-1/2"></div>
            <div class="h-8 bg-gray-300 dark:bg-gray-700/60 rounded-full w-20"></div>
        </div>
        <div class="space-y-4 mb-8">
            <div class="h-4 bg-gray-300 dark:bg-gray-700/60 rounded w-3/4"></div>
            <div class="h-4 bg-gray-300 dark:bg-gray-700/60 rounded w-1/2"></div>
        </div>
        <div class="h-12 bg-gray-300 dark:bg-gray-700/60 rounded-xl mt-auto"></div>
      </div>
    `;
  }
  container.innerHTML = skeletons;
}