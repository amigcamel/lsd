const htmlCache = new Map()

function loadHTML (file, cache = true) {
  // save cache
  if (cache) {
    const ele = document.querySelector('li#sidebar a.active')
    const currFile = /\('(.+?)'\)/g.exec(ele.getAttribute('onclick'))[1]
    htmlCache[currFile] = document.querySelector('.content').innerHTML
    console.log(`Save cache: ${currFile}`)
    console.log(htmlCache[currFile])
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
    console.log(htmlCache[file])
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
