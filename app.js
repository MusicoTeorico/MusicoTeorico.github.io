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

function browseTab() {
  const clickedTab = document.getElementById('browse-tab');
  clickedTab.classList.add('active');
  const otherTab = document.getElementById('search-tab');
  otherTab.classList.remove('active');
  document.getElementById('search').hidden = true;
  document.getElementById('browse').hidden = false;
}

document.addEventListener("DOMContentLoaded", function () {
  const paginationContainer = document.createElement('div');
  paginationContainer.className = 'pagination-container';
  paginationContainer.innerHTML = `
    <button id="prev-page">Página Anterior</button>
    <button id="next-page">Página Siguiente</button>
  `;
  const browseSection = document.getElementById('browse');
  browseSection.appendChild(paginationContainer);

  document.getElementById('next-page').addEventListener('click', goToNextPage);

  updatePagination();
  renderBrowse();
});

