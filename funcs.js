const fs = require('fs')
const path = require('path')
const {spawnSync} = require('child_process')

const cheerio = require('cheerio')
const got = require('got')
const _ = require('underscore')

const headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:73.0) Gecko/20100101 Firefox/73.0'}
global._downloaded = 0

async function req (keyword) {
  const url = `https://store.line.me/api/search/sticker?query=${encodeURI(keyword)}&offset=0&limit=36`
  try {
    const response = await got(url, {headers: headers})
    return JSON.parse(response.body)
  } catch (error) {
    console.log(error)
  }
}

async function extractStickerPage (id) {
  const url = `https://store.line.me/stickershop/product/${id}`
  const urls = [];
  try {
    const response = await got(url, {headers: headers})
    const $ = cheerio.load(response.body)
    $('.FnStickerPreviewItem').each(function(i, elem) {
      let data = JSON.parse($(this).attr('data-preview'))
      let url = data.animationUrl || data.staticUrl
      urls.push(url)
      console.log(url)
    })
    return urls
  } catch (error) {
    console.log(error)
  }
}

async function downloadImage (id, dir, cover = false) {
  let url
  if (cover) {
    url = `https://stickershop.line-scdn.net/stickershop/v1/product/${id}/LINEStorePC/thumbnail_shop.png`
  } else {
    if (id.startsWith('http')) {
      url = id  // TODO: should change `id` to another name
      id = /\/(\d+)\//g.exec(url)[1]
    } else {
      url = `https://stickershop.line-scdn.net/stickershop/v1/sticker/${id}/android/sticker.png`
    }
  }
  try {
    const response = await got(url, {headers: headers, encoding: 'binary'})
    const filepath = `${dir}${id}.png`
    fs.writeFile(filepath, response.body, 'binary', (err) => {
      if (err) {
        throw err
      } else {
        if (cover) {
          return 1
        }
        global._downloaded += 1
        console.log(`Image saved: ${filepath}`)
        console.log(global._downloaded)
      }
    })
  } catch (error) {
    console.log(error)
  }
}

async function getRandomPopular (sampleSize = 7) {
  const url = `https://store.line.me/stickershop/showcase/top?page=${_.random(1, 50)}` 
  const items = []
  try {
    const response = await got(url, {headers: headers})
    const $ = cheerio.load(response.body)
    $('div.LyMain > section > div > ul > li').each(function() {
      const href = $(this).find('a').attr('href')
      const src = $(this).find('img').attr('src')
      items.push(src)
    })
    return _.sample(items, sampleSize)
  } catch (error) {
    console.log(error)
  }
}

// copy from: https://gist.github.com/victorsollozzo/4134793
function recFindByExt(base, ext, files, result) {
  files = files || fs.readdirSync(base) 
  result = result || [] 

  files.forEach( 
    function (file) {
      var newbase = path.join(base,file)
      if ( fs.statSync(newbase).isDirectory() )
      {
        result = recFindByExt(newbase,ext,fs.readdirSync(newbase),result)
      }
      else {
        if ( file.substr(-1*(ext.length+1)) == '.' + ext ) {
          result.push(newbase)
        } 
      }
    }
  )
  return result
}

function deleteFolder(path) {
  fs.rmdir(path, {recursive: true}, (err) => {
    if (err) {
      throw err
    }
    console.log(`Deleted: ${path}`)
  })
}

function deleteFile(path) {
  fs.unlink(path, (err) => {
    if (err) {
      throw err
    }
    console.log(`Deleted: ${path}`)
  })
}


function apng2gif(path) {
  const target = path.replace('.png', '.gif')
  if (!fs.existsSync(target)) {
    spawnSync('./apng2gif', [path, target])
  }
  return target
}

exports.req = req
exports.extractStickerPage = extractStickerPage
exports.downloadImage = downloadImage
exports.getRandomPopular = getRandomPopular
exports.recFindByExt = recFindByExt
exports.deleteFile = deleteFile
exports.deleteFolder = deleteFolder
exports.apng2gif = apng2gif
