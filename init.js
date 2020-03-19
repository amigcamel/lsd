fetch('dashboard.html')
  .then(data => data.text())
  .then(html => document.querySelector('.content').innerHTML = html
);
