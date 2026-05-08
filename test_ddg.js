async function search() {
  const q = encodeURIComponent('minecraft plugins');
  const searchRes = await fetch(`https://html.duckduckgo.com/html/?q=${q}`, {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
  });
  const html = await searchRes.text();
  
  const results = [];
  const regex = /<a class="result__url" href="([^"]+)">/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
      let url = match[1];
      if (url.startsWith('//duckduckgo.com/l/?uddg=')) {
          url = decodeURIComponent(url.split('uddg=')[1].split('&')[0]);
      }
      results.push(url);
  }
  console.log(results);
}
search();
