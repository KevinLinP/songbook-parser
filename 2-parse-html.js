const _ = require('lodash')
const fs = require('fs')
const cheerio = require('cheerio')
const TurndownService = require('turndown')
const turndownService = new TurndownService()

const one = false

function getSong(filename) {
  const fileContent = fs.readFileSync(filename, {encoding: 'utf8'})
  const $ = cheerio.load(fileContent)
  let markdown = turndownService.turndown(fileContent)

  // markdown = markdown.replaceAll(/$>\w/, '');
  let title = $('h1').text();
  title = _.replace(title, /\s+/g, ' ')
  title = title.trim()

  let mainContent = markdown.split(/=.+/)[1]

  let tune = null
  let tuneReplacer = function (match, p1) {
    tune = p1.trim()
    return ''
  }
  mainContent = mainContent.replace(/\*\*tune:\*\*\s+(.+)/i, tuneReplacer)

  let keywords = null
  let keywordsReplacer = function (match, p1) {
    keywords = p1
    return ''
  }
  mainContent = mainContent.replace(/keywords:\s+(.+)/i, keywordsReplacer)

  mainContent = mainContent.trim()
  keywords = keywords.split(',').map(function(v) {return v.trim()})
  keywords = _.compact(keywords)

  return {
    title,
    mainContent,
    keywords,
    tune,
    filename,
  }
}

if (one) {
  console.log(getSong(`result/A/${urls[0]}`))
} else {
  urls.forEach(function(url) {
    console.log(getSong(`result/A/${url}`))
  })
}