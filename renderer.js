const fs = require('fs')
const os = require('os')

const {dialog} = require('electron').remote

const spinner = '<div class="text-center"><i class="fas fa-spinner fa-spin fa-4x"></i></div>'
const htmlCache = new Map()

global.downloadFolder = os.homedir() + '/LSD'

function setDownloadFolder(path) {
  document.getElementById('download-folder').value = global.downloadFolder
}

function chooseFolder() {
  global.downloadFolder = dialog.showOpenDialogSync({properties: ['openDirectory']}) + '/LSD'
  setDownloadFolder()
}

function renderPopularStickers() {
  let ele = document.getElementById('popular-stickers')
  ele.innerHTML = spinner 
  p = window.funcs.getRandomPopular()
  p.then((data) => {
    ele.innerHTML = ''
    for (const idx in data) {
      const id = /product\/(\d+)/g.exec(data[idx])[1]
      ele.innerHTML += `<a href="#" onclick="showStickersWrap()"><img data-id="${id}" src="${data[idx]}" alt="${idx}" /></a>`
    }
  })
}

function searchStickers() {
  document.getElementById('sub-wrapper').style.display = 'none'
  keyword = document.getElementById('keyword').value
  const p = window.funcs.req(keyword)
  let ele = document.getElementById('stickers')
  ele.innerHTML = spinner 
  p.then((data) => {
      ele.innerHTML = ''
      for (const item of data.items) {
        ele.innerHTML += `<a href="#" onclick="showStickersWrap()"><img src="${item.listIcon.src}" alt="${item.title}" data-id="${item.id}" /></a>`
      }
    })
}

function showStickers(id) {
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

function downloadStickers() {
  const dir = `${global.downloadFolder}/${global.stickerId}/`
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, {recursive: true})
  }
  global.urls.forEach((url) => {
    window.funcs.downloadImage(/\/(\d+)\//g.exec(url)[1], dir)
  })
  alert(`Stickers will be saved to: ${dir}`)
}

function showStickersWrap() {
    document.getElementById('sub-wrapper').style.display = 'block'
    showStickers(event.target.dataset.id)
}

function loadHTML (file, cache = true) {
  // execute necessary scripts
  if (file.search('settings.html') != -1) {
    setTimeout(() => {setDownloadFolder()}, 100)  // XXX: bad practice
  }
  // save cache
  if (cache) {
    const ele = document.querySelector('li#sidebar a.active')
    const currFile = /\('(.+?)'\)/g.exec(ele.getAttribute('onclick'))[1]
    htmlCache[currFile] = document.querySelector('.content').innerHTML
    console.log(`Save cache: ${currFile}`)
  }
  // set "active" class
  document.querySelectorAll('li#sidebar > a').forEach((ele) => {
    if (ele.getAttribute('onclick').search(file) != -1) {
      ele.classList.add('active')
    } else {
      ele.classList.remove('active')
    }
  })
  // load HTML
  if (file in htmlCache) {
    console.log(`Retrieve cache: ${file}`)
    document.querySelector('.content').innerHTML = htmlCache[file]
  } else {
    fetch(file)
      .then((data) => {
        return data.text()
      })
      .then((html) => {
        document.querySelector('.content').innerHTML = html
      })
  }
}

loadHTML('./dashboard.html', false)

// render popular stickers on startup
setTimeout(function() {
  renderPopularStickers()
}, 200)
