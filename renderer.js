const fs = require('fs')
const os = require('os')

const {dialog} = require('electron').remote

global.downloadFolder = os.homedir()
document.getElementById('download-folder').value = global.downloadFolder

document.getElementById('search-btn').addEventListener('click', (e) => {
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
  global.stickerId = event.target.dataset.id
  const p = window.funcs.extractStickerPage(event.target.dataset.id)
  let ele = document.getElementById('sub-content')
  ele.innerHTML = ''
  p.then((data) => {
    global.urls = data
    for (const idx in data) {
      const id = /\/(\d+)\//g.exec(data[idx])[1]
      ele.innerHTML += `<img id="${id}" class="sub" src="${data[idx]}" alt="${idx}" />`
    }
  })
}

document.addEventListener('click', function(event) {
  if (event.target.className == 'preview') {
    document.getElementById('sub-wrapper').style.display = 'block'
    showPrev(event)
  }
  // if (event.target.className == 'sub') {
  //   window.funcs.downloadImage(event.target.id)
  // }
  if (event.target.id == 'sub-download-all') {
    const dir = `${global.downloadFolder}/${global.stickerId}/`
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir)
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
