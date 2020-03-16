const remote = require('electron').remote

document.getElementById('download-btn').addEventListener('click', (e) => {
  keyword = document.getElementById('keyword').value
  const p = window.funcs.req(keyword)
  let ele = document.getElementById('content')
  ele.innerHTML = ''
  p.then((data) => {
      for (const item of data.items) {
        ele.innerHTML += `<img class="preview" src="${item.listIcon.src}" alt="${item.title}" data-id="${item.id}" />`
      }
    })
})

function showPrev(event) {
  const p = window.funcs.extractStickerPage(event.target.dataset.id)
  let ele = document.getElementById('sub')
  ele.innerHTML = ''
  p.then((data) => {
    global.urls = data
    for (const idx in data) {
      ele.innerHTML += `<img class="sub" src="${data[idx]}" alt="${idx}" />`
    }
  })
}

document.addEventListener('click', function(event) {
  if (event.target.className == 'preview') {
    showPrev(event)
  }
  if (event.target.className == 'sub') {
    alert('ok')
  }
})
