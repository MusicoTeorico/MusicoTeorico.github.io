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
let browseDocuments = searchDocuments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

// Pagination settings
const pageSize = 50;
let page = 1;
let browseIndex = (page - 1) * pageSize;

// Update pagination buttons
function updatePagination() {
  document.getElementById('prev-page').disabled = page === 1;
  document.getElementById('next-page').disabled = page >= Math.ceil(browseDocuments.length / pageSize);
}

// Render browse view
function renderBrowse() {
  const output = browseDocuments.slice(browseIndex, browseIndex + pageSize).map(item => `
    <p class="search_item">
      <div class="search_link"><a href="MusicoTeorico/status/${item.id_str}">link</a></div>
      <div class="search_text">${item.full_text}</div>
      <div class="search_time">${new Date(item.created_at).toLocaleString()}</div>
      <hr class="search_divider" />
    </p>`.replace(/\.\.\/\.\.\/tweets_media\//g, 'MusicoTeorico/tweets_media/')
  );

  document.getElementById('browse-output').innerHTML = output.join('');
  document.getElementById('browse-output').innerHTML += '<a href="#tabs">top &uarr;</a>';

  // Procesar los videos de YouTube después de renderizar
  embedYouTubeVideos();
}

// Embed YouTube videos in tweets
function embedYouTubeVideos() {
  document.querySelectorAll(".search_item").forEach(tweet => {
    let links = tweet.querySelectorAll("a");

    links.forEach(link => {
      let url = link.href;
      let youtubeMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);

      if (youtubeMatch) {
        let videoId = youtubeMatch[2];
        let iframe = document.createElement("iframe");
        let br = document.createElement("br"); // Salto de línea antes del iframe
        iframe.src = `https://www.youtube.com/embed/${videoId}`;
        iframe.width = "100%";
        iframe.height = "315";
        iframe.frameBorder = "0";
        iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
        iframe.allowFullscreen = true;

        link.replaceWith(br, iframe); // Añadir el salto de línea antes de reemplazar
      }
    });
  });
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
  document.getElementById('browse-tab').classList.add('active');
  document.getElementById('search-tab').classList.remove('active');
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


