let results = [];

// Inicializa FlexSearch
var index = new FlexSearch.Document({
    encode: function (str) {
        const cjkItems = str.replace(/[\x00-\x7F]/g, "").split("");
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
const browseOutput = document.getElementById('browse-output');
const loadingIndicator = document.getElementById('loading');
const searchSection = document.getElementById('search');

// Variables de paginación
const pageSize = 50;
let page = 1;
let browseDocuments = [];

// Procesar datos y agregar al índice de búsqueda
function processData(data) {
    browseDocuments = [...data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    data.forEach(doc => {
        index.add({
            id_str: doc.id_str,
            created_at: doc.created_at,
            full_text: doc.full_text,
            favorite_count: doc.favorite_count,
            retweet_count: doc.retweet_count
        });
    });
    loadingIndicator.hidden = true;
    searchSection.hidden = false;
    renderBrowse();
    updatePagination();
}

// Actualizar paginación
function updatePagination() {
    document.getElementById('prev-page').disabled = page === 1;
    document.getElementById('next-page').disabled = page >= Math.ceil(browseDocuments.length / pageSize);
}

// Renderizar tweets en la sección de navegación
function renderBrowse() {
    if (!browseDocuments.length) return;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const output = browseDocuments.slice(start, end).map(item => `
        <div class="tweet">
            <p class="search_item">
                <div class="search_link"><a href="https://twitter.com/MusicoTeorico/status/${item.id_str}" target="_blank">Ver en Twitter</a></div>
                <div class="search_text">${embedYouTubeLinks(item.full_text)}</div>
                <div class="search_time">${new Date(item.created_at).toLocaleString()}</div>
            </p>
            <hr class="search_divider" />
        </div>
    `).join('');
    browseOutput.innerHTML = output;
    browseOutput.innerHTML += '<a href="#tabs">top &uarr;</a>';
}

// Incrustar videos de YouTube
function embedYouTubeLinks(text) {
    return text.replace(/(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+))/g, (match, url, videoId) => {
        return `<br><iframe width="100%" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    });
}

// Cambiar a la siguiente página
function goToNextPage() {
    if (page < Math.ceil(browseDocuments.length / pageSize)) {
        page++;
        renderBrowse();
        updatePagination();
    }
}

// Cambiar a la página anterior
function goToPrevPage() {
    if (page > 1) {
        page--;
        renderBrowse();
        updatePagination();
    }
}

// Implementar botón de tweet aleatorio
function getRandomTweet() {
    if (browseDocuments.length === 0) return;
    const randomIndex = Math.floor(Math.random() * browseDocuments.length);
    const randomTweet = browseDocuments[randomIndex];
    alert(`Tweet aleatorio: \n${randomTweet.full_text}`);
}

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById('next-page').addEventListener('click', goToNextPage);
    document.getElementById('prev-page').addEventListener('click', goToPrevPage);
    document.getElementById('random-tweet').addEventListener('click', getRandomTweet);
    processData(searchDocuments);
});
