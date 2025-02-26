let results;

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

function processData(data) {
  for (doc of data) {
    index.add({
      id_str: doc.id_str,
      created_at: doc.created_at,
      full_text: doc.full_text,
      favorite_count: doc.favorite_count,
      retweet_count: doc.retweet_count
    });
  };
  document.getElementById('loading').hidden = true;
  document.getElementById('search').hidden = false;
}

processData(searchDocuments);
let browseDocuments = searchDocuments.sort(function (a, b) {
  return new Date(b.created_at) - new Date(a.created_at);
});

const pageSize = 50;
let page = 1;
let browseIndex = (page - 1) * pageSize;

function updatePagination() {
  document.getElementById('page-num').value = page;
  document.getElementById('page-total').innerText = Math.ceil(browseDocuments.length / pageSize);
  document.getElementById('prev-page').disabled = page === 1;
  document.getElementById('next-page').disabled = page === Math.ceil(browseDocuments.length / pageSize);
}

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
}

function goToNextPage() {
  if (page < Math.ceil(browseDocuments.length / pageSize)) {
    page++;
    browseIndex = (page - 1) * pageSize;
    renderBrowse();
    updatePagination();
  }
}

function goToPrevPage() {
  if (page > 1) {
    page--;
    browseIndex = (page - 1) * pageSize;
    renderBrowse();
    updatePagination();
  }
}

document.addEventListener("DOMContentLoaded", function () {
  // Agregar controles de paginación al DOM
  const paginationControls = document.createElement('div');
  paginationControls.className = 'pagination-controls';
  paginationControls.innerHTML = `
    <button id="prev-page">Página Anterior</button>
    <span>Página <input type="number" id="page-num" min="1" value="1" readonly> de <span id="page-total"></span></span>
    <button id="next-page">Página Siguiente</button>
  `;
  document.getElementById('browse-output').insertAdjacentElement('afterend', paginationControls);

  document.getElementById('next-page').addEventListener('click', goToNextPage);
  document.getElementById('prev-page').addEventListener('click', goToPrevPage);

  updatePagination();
  renderBrowse();
});
