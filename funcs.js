const fs = require('fs')

const cheerio = require('cheerio')
const got = require('got')

const map = new Map()

async function req (keyword) {
  const url = `https://store.line.me/api/search/sticker?query=${encodeURI(keyword)}&offset=0&limit=36`
  try {
    const response = await got(url, {cache: map})
    return JSON.parse(response.body)
  } catch (error) {
    console.log(error)
  }
}

async function extractStickerPage (id) {
  const url = `https://store.line.me/stickershop/product/${id}`
  const urls = [];
  try {
    const response = await got(url, {cache: map})
    const $ = cheerio.load(response.body)
    $('.FnPreview').each(function(i, elem) {
      urls.push(/url\((.+\.png)/g.exec($(this).attr('style'))[1])
    })
    console.log('--------------------------')
    console.log(response.isFromCache)
    return urls
  } catch (error) {
    console.log(error)
  }
}

exports.req = req
exports.extractStickerPage = extractStickerPage
