const fs = require('fs')
const os = require('os')

const {dialog} = require('electron').remote

const spinner = '<div class="text-center"><i class="fas fa-spinner fa-spin fa-4x"></i></div>'

global.downloadFolder = os.homedir() + '/LSD'




document.getElementById('download-folder').value = global.downloadFolder

function renderPopularStickers() {
  let ele = document.getElementById('popular-stickers')
  ele.innerHTML = spinner 
  p = window.funcs.getRandomPopular()
  p.then((data) => {
    ele.innerHTML = ''
    for (const idx in data) {
      const id = /product\/(\d+)/g.exec(data[idx])[1]
      ele.innerHTML += `<img data-id="${id}" class="preview" src="${data[idx]}" alt="${idx}" />`
    }
  })
}

document.getElementById('search-btn').addEventListener('click', (e) => {
  document.getElementById('sub-wrapper').innerHTML = ''
  keyword = document.getElementById('keyword').value
  const p = window.funcs.req(keyword)
  let ele = document.getElementById('stickers')
  ele.innerHTML = spinner 
  p.then((data) => {
      ele.innerHTML = ''
      for (const item of data.items) {
        ele.innerHTML += `<img class="preview" src="${item.listIcon.src}" alt="${item.title}" data-id="${item.id}" />`
      }
    })
})

function showPrev(id) {
  global.stickerId = id
  const p = window.funcs.extractStickerPage(id)
  let ele = document.getElementById('sub-stickers')
  ele.innerHTML = spinner 
  p.then((data) => {
    global.urls = data
    ele.innerHTML = ''
    for (const idx in data) {
      const id = /\/(\d+)\//g.exec(data[idx])[1]
      ele.innerHTML += `<img id="${id}" class="sub" src="${data[idx]};compress=true" alt="${idx}" />`
    }
  })
}

document.addEventListener('click', function(event) {
  if (event.target.className == 'preview') {
    document.getElementById('sub-wrapper').style.display = 'block'
    showPrev(event.target.dataset.id)
  }
  if (event.target.id == 'reload-popular-stickers') {
    renderPopularStickers()
  }
  if (event.target.id == 'sub-download-all') {
    const dir = `${global.downloadFolder}/${global.stickerId}/`
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, {recursive: true})
    }
    global.urls.forEach((url) => {
      window.funcs.downloadImage(/\/(\d+)\//g.exec(url)[1], dir)
    })
    alert(`Stickers will be saved to: ${dir}`)
  }
  if (event.target.id == 'choose-directory') {
    global.downloadFolder = dialog.showOpenDialogSync({properties: ['openDirectory']})
    document.getElementById('download-folder').value = global.downloadFolder
  }
})

document.addEventListener("DOMContentLoaded", function(event) {
  renderPopularStickers()
});
