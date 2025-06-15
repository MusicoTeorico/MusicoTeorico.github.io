let results;

var index = new FlexSearch.Document({
  encode: function(str){
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
    })
  };
  document.getElementById('loading').hidden = true;
  document.getElementById('search').hidden = false;
}

processData(searchDocuments);
let browseDocuments = searchDocuments.sort(function(a,b){
  return new Date(b.created_at) - new Date(a.created_at);
});

function sortResults(criterion) {
  if (criterion === 'newest-first') {
    results = results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    renderResults();
  }
  if (criterion === 'oldest-first') {
    results = results.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    renderResults();
  }
  if (criterion === 'most-relevant') {
    results = results.sort((a, b) => a.index - b.index);
    renderResults();
  }
  if (criterion === 'most-popular') {
    results = results.sort((a, b) =>
      (+b.favorite_count + +b.retweet_count) - (+a.favorite_count + +a.retweet_count)
    );
    renderResults();
  }
  if (criterion === 'newest-first-browse') {
    browseDocuments = browseDocuments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    renderBrowse();
  }
  if (criterion === 'oldest-first-browse') {
    browseDocuments = browseDocuments.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    renderBrowse();
  }
  if (criterion === 'most-popular-browse') {
    browseDocuments = browseDocuments.sort((a, b) =>
      (+b.favorite_count + +b.retweet_count) - (+a.favorite_count + +a.retweet_count)
    );
    renderBrowse();
  }
}

// Función para detectar enlaces y generar una vista previa simple
function getLinkPreview(text) {
  if (text.includes("<video") || text.includes("<iframe")) return "";

  const urlRegex = /(https?:\/\/[^\s<>"']+)/g;
  const urls = text.match(urlRegex);
  if (urls && urls.length > 0) {
    const url = urls[0];
    return `<div class="link_preview"><a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a></div>`;
  }
  return '';
}

function renderResults() {
  const output = results.map(item => {
    const preview = getLinkPreview(item.full_text);
    return `
      <p class="search_item">
        <div class="search_link">
          <a href="Sign_in_music/status/${item.id_str}" target="_blank">Ver tuit</a>
        </div>
        ${preview}
        <div class="search_text">${item.full_text}</div>
        <div class="search_time">${new Date(item.created_at).toLocaleString()}</div>
        <hr class="search_divider" />
      </p>`.replace(/\.\.\/\.\.\/tweets_media\//g, 'Sign_in_music/tweets_media/');
  });
  document.getElementById('output').innerHTML = output.join('');
  if (results.length > 0) {
    document.getElementById('output').innerHTML += '<a href="#tabs">top &uarr;</a>';
  }
}

function onSearchChange(e) {
  results = index.search(e.target.value, { enrich: true });
  if (results.length > 0) {
    results = results.slice(0, 100);
    results = results[0].result.map((item, index) => {
      let result = item.doc;
      result.index = index;
      return result;
    });
  }
  renderResults();
}
searchInput.addEventListener('input', onSearchChange);

function searchTab() {
  const clickedTab = document.getElementById('search-tab');
  clickedTab.classList.add('active');
  const otherTab = document.getElementById('browse-tab');
  otherTab.classList.remove('active');
  document.getElementById('browse').hidden = true;
  document.getElementById('search').hidden = false;
}

function browseTab() {
  const clickedTab = document.getElementById('browse-tab');
  clickedTab.classList.add('active');
  const otherTab = document.getElementById('search-tab');
  otherTab.classList.remove('active');
  document.getElementById('search').hidden = true;
  document.getElementById('browse').hidden = false;
}

const pageSize = 50;
const pageMax = Math.floor(browseDocuments.length / pageSize) + 1;
let page = 1;
let browseIndex = (page - 1) * pageSize;

function onPageNumChange(e) {
  page = e.target.value;
  browseIndex = (page - 1) * pageSize;
  renderBrowse();
}

document.getElementById('page-total').innerText = pageMax;
document.getElementById('page-num').addEventListener('input', onPageNumChange);
document.getElementById('page-num').value = +page;
document.getElementById('page-num').max = pageMax;
document.getElementById('page-num').min = 1;

function renderBrowse() {
  const output = browseDocuments.slice(browseIndex, browseIndex + pageSize).map(item => {
    const preview = getLinkPreview(item.full_text);
    return `
      <p class="search_item">
        <div class="search_link">
          <a href="Sign_in_music/status/${item.id_str}" target="_blank">Ver tuit</a>
        </div>
        ${preview}
        <div class="search_text">${item.full_text}</div>
        <div class="search_time">${new Date(item.created_at).toLocaleString()}</div>
        <hr class="search_divider" />
      </p>`.replace(/\.\.\/\.\.\/tweets_media\//g, 'Sign_in_music/tweets_media/');
  });
  document.getElementById('browse-output').innerHTML = output.join('');
  document.getElementById('browse-output').innerHTML += '<a href="#tabs">top &uarr;</a>';
}

renderBrowse();
