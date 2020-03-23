const fs = require('fs')
const os = require('os')

const {ipcRenderer} = require('electron')
const {dialog} = require('electron').remote
const Store = require('electron-store');

const spinner = '<div class="text-center"><i class="fas fa-spinner fa-spin fa-4x"></i></div>'
const htmlCache = new Map()
const store = new Store()
const defaultDownloadDir = os.homedir() + '/LSD'

function getCoverDir() {
  const dir = store.get('downloadDir', defaultDownloadDir) + '/.covers/'
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, {recursive: true})
  }
  return dir
}

function deleteStickers() {
  const path = store.get('downloadDir', defaultDownloadDir)
	window.funcs.deleteFolder(path)
}

function displayCovers() {
  let ele = document.getElementById('collections-content')
  ele.innerHTML = ''
  window.funcs.recFindByExt(getCoverDir(), 'png').forEach((src, idx) => {
    // ele.innerHTML += `<img src="${src}" alt="${ele}" width="10%"/>`
    ele.innerHTML += `<div class="col-sm-2"><a href="#"><img src="${src}" class="img-fluid mb-2""/></a></div>`
  })
}

function displayAllStickers() {
  let ele = document.querySelector('.content')
  ele.innerHTML = ''
  window.funcs.recFindByExt(store.get('downloadDir', defaultDownloadDir), 'png').forEach((src, idx) => {
    ele.innerHTML += `<img src="${src}" alt="${ele}" width="10%"/>`
  })
  setTimeout(() => {
    document.querySelectorAll('img').forEach(function(event) {
      event.ondragstart = (event) => {
        event.preventDefault()
        ipcRenderer.send('ondragstart', event.target.getAttribute('src'))  // native file drag, ref: https://www.electronjs.org/docs/tutorial/native-file-drag-drop
      } 
    })
  }, 100)  // XXX: bad practice
}

function setDownloadFolder(path) {
  document.getElementById('download-folder').value = store.get('downloadDir', defaultDownloadDir) 
}

function chooseFolder() {
  store.set('downloadDir', dialog.showOpenDialogSync({properties: ['openDirectory']}) + '/LSD')
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
        ele.innerHTML += `<div class="col-sm-2"><a href="#" onclick="showStickersWrap()"><img src="${item.listIcon.src}" alt="${item.title}" data-id="${item.id}" /></a></div>`
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

function showDownloadProgress() {
  const footer = document.getElementById('footer-progress')
  let monitor = setInterval(() => {
    footer.style.display = 'block'
    const ele = document.getElementById('download-progress')
    let percentage = `${Math.round(global._downloaded / global.urls.length * 100)}%`
    ele.style.width = percentage
    ele.innerText = percentage
    console.log(ele.style.width)
    if (global._downloaded == global.urls.length) {
      clearInterval(monitor)
      setTimeout(() => {
        $(document).Toasts('create', {
          title: `<img src="https://stickershop.line-scdn.net/stickershop/v1/product/${global.stickerId}/LINEStorePC/thumbnail_shop.png;compress=true" style="width:50%">`,
          body: 'Download completed',
          class: 'bg-success',
          autohide: true,
          delay: 2000
        })
      }, 600)
      setTimeout(() => {
        footer.style.display = 'none'
      }, 2000)
    }
  }, 100)
}

function downloadStickers() {
  const dir = `${store.get('downloadDir', defaultDownloadDir)}/${global.stickerId}/`
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, {recursive: true})
  }
  window.funcs.downloadImage(global.stickerId, getCoverDir(), true)
  global._downloaded = 0
  document.getElementById('download-progress').style.width = '0%'
  global.urls.forEach((url) => {
    window.funcs.downloadImage(/\/(\d+)\//g.exec(url)[1], dir)
  })
  showDownloadProgress()
}

function showStickersWrap() {
    document.getElementById('sub-wrapper').style.display = 'block'
    showStickers(event.target.dataset.id)
}

function loadHTML (file, cache = true) {
  // execute necessary scripts
  if (file.search('settings.html') != -1) {
    setTimeout(() => {setDownloadFolder()}, 100)  // XXX: bad practice
  } else if (file.search('collections.html') != -1) {
    setTimeout(() => {
      // displayAllStickers()
      displayCovers()
    }, 100)  // XXX: bad practice
  }
  // save cache
  if (cache) {
    const ele = document.querySelector('div.sidebar ul li a.active')
    const currFile = /\('(.+?)'\)/g.exec(ele.getAttribute('onclick'))[1]
    htmlCache[currFile] = document.querySelector('.content').innerHTML
    console.log(`Save cache: ${currFile}`)
  }
  // set "active" class
  document.querySelectorAll('div.sidebar ul li a').forEach((ele) => {
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
