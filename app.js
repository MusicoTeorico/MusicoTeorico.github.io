let results;

// Initialize FlexSearch
var index = new FlexSearch.Document({
  encode: function (str) {
    const cjkItems = str.replace(/[\x00-]/g, "").split("");
    const asciiItems = str.toLowerCase().split(/\W+/);
    return cjkItems.concat(asciiItems);
  },
  document: {
    id: "id_str",
    index: ["full_text"],
    store: true
  }
});

const searchInput = document.getElementById('search-input');

// Process data and add to FlexSearch index
function processData(data) {
  for (const doc of data) {
    index.add({
      id_str: doc.id_str,
      created_at: doc.created_at,
      full_text: doc.full_text,
      favorite_count: doc.favorite_count,
      retweet_count: doc.retweet_count
    });
  }
  document.getElementById('loading').hidden = true; // Hide loading indicator
  document.getElementById('search').hidden = false; // Show search section
}

// Process initial data
processData(searchDocuments);

// Sort documents by date
let browseDocuments = searchDocuments.sort(function (a, b) {
  return new Date(b.created_at) - new Date(a.created_at);
});

// Pagination settings
const pageSize = 50;
let page = 1;
let browseIndex = (page - 1) * pageSize;

// Update pagination buttons
function updatePagination() {
  document.getElementById('prev-page').disabled = page === 1;
  document.getElementById('next-page').disabled = page === Math.ceil(browseDocuments.length / pageSize);
}

// Embed YouTube links in text
function embedYouTubeLinks(text) {
  // Expresión regular mejorada para detectar enlaces de YouTube que no estén ya dentro de un iframe
  const youtubeRegex = /(?<!<iframe[^>]*>)(?:https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)(?:&t=(\d+[ms]?|\d+m\d+s))?|https?:\/\/youtu\.be\/([a-zA-Z0-9_-]+)(?:\?t=(\d+[ms]?|\d+m\d+s))?)/gi;

  return text.replace(youtubeRegex, (match, p1, p2, p3, p4) => {
    const videoId = p1 || p3; // Extraer el ID del video
    const startTime = p2 || p4; // Extraer el tiempo de inicio (si existe)

    // Convertir el tiempo de inicio a segundos si es necesario
    let startTimeInSeconds = 0;
    if (startTime) {
      if (startTime.includes('m')) {
        // Formato: 1m30s
        const [minutes, seconds] = startTime.split('m');
        startTimeInSeconds = parseInt(minutes) * 60 + (parseInt(seconds) || 0);
      } else {
        // Formato: 90s o 90
        startTimeInSeconds = parseInt(startTime);
      }
    }

    // Construir la URL del iframe con el tiempo de inicio
    const iframeUrl = `https://www.youtube.com/embed/${videoId}${startTimeInSeconds ? `?start=${startTimeInSeconds}` : ''}`;

    // Devolver el iframe centrado y con saltos de línea
    return `<br><div style="text-align: center;"><iframe width="560" height="315" src="${iframeUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div><br>`;
  });
}


// Render browse view
function renderBrowse() {
  const output = browseDocuments.slice(browseIndex, browseIndex + pageSize).map(item => `
    <p class="search_item">
      <div class="search_link"><a href="MusicoTeorico/status/${item.id_str}">link</a></div>
      <div class="search_text">${embedYouTubeLinks(item.full_text)}</div>
      <div class="search_time">${new Date(item.created_at).toLocaleString()}</div>
      <hr class="search_divider" />
    </p>`.replace(/\.\.\/\.\.\/tweets_media\//g, 'MusicoTeorico/tweets_media/')
  );
  document.getElementById('browse-output').innerHTML = output.join('');
  document.getElementById('browse-output').innerHTML += '<a href="#tabs">top &uarr;</a>';
}

// Go to next page
function goToNextPage() {
  if (page < Math.ceil(browseDocuments.length / pageSize)) {
    page++;
    browseIndex = (page - 1) * pageSize;
    renderBrowse();
    updatePagination();
  }
}

// Go to previous page
function goToPrevPage() {
  if (page > 1) {
    page--;
    browseIndex = (page - 1) * pageSize;
    renderBrowse();
    updatePagination();
  }
}

// Switch to browse tab
function browseTab() {
  const clickedTab = document.getElementById('browse-tab');
  clickedTab.classList.add('active');
  const otherTab = document.getElementById('search-tab');
  otherTab.classList.remove('active');
  document.getElementById('search').hidden = true;
  document.getElementById('browse').hidden = false;
}

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", function () {
  const paginationContainer = document.createElement('div');
  paginationContainer.className = 'pagination-container';
  paginationContainer.innerHTML = `
    <button id="prev-page">Página Anterior</button>
    <button id="next-page">Página Siguiente</button>
  `;

  const browseSection = document.getElementById('browse');

  // Remove existing pagination if it exists
  const existingPagination = document.querySelector('.pagination-container');
  if (existingPagination) {
    existingPagination.remove();
  }

  browseSection.appendChild(paginationContainer);

  // Add event listeners for pagination
  document.getElementById('next-page').addEventListener('click', goToNextPage);
  document.getElementById('prev-page').addEventListener('click', goToPrevPage);

  // Initial render
  updatePagination();
  renderBrowse();
});
