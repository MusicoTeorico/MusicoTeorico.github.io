function renderResults() {
  const output = results.map(item => `
    <p class="search_item">
      <div class="search_link">
        <a href="Sign_in_music/status/${item.id_str}" target="_blank">link</a>
        <div class="link_preview">${getLinkPreview(item.full_text)}</div>
      </div>
      <div class="search_text">${item.full_text}</div>
      <div class="search_time">${new Date(item.created_at).toLocaleString()}</div>
      <hr class="search_divider" />
    </p>`.replace(/\.\.\/\.\.\/tweets_media\//g, 'Sign_in_music/tweets_media/'));
  document.getElementById('output').innerHTML = output.join('');
  if (results.length > 0) {
    document.getElementById('output').innerHTML += '<a href="#tabs">top &uarr;</a>';
  }
}

function renderBrowse() {
  const output = browseDocuments.slice(browseIndex, browseIndex + pageSize).map(item => `
    <p class="search_item">
      <div class="search_link">
        <a href="Sign_in_music/status/${item.id_str}" target="_blank">link</a>
        <div class="link_preview">${getLinkPreview(item.full_text)}</div>
      </div>
      <div class="search_text">${item.full_text}</div>
      <div class="search_time">${new Date(item.created_at).toLocaleString()}</div>
      <hr class="search_divider" />
    </p>`.replace(/\.\.\/\.\.\/tweets_media\//g, 'Sign_in_music/tweets_media/'));
  document.getElementById('browse-output').innerHTML = output.join('');
  document.getElementById('browse-output').innerHTML += '<a href="#tabs">top &uarr;</a>';
}
