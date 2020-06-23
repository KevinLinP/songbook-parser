const _ = require('lodash')
const fs = require('fs')
const axios = require('axios')
const cheerio = require('cheerio')
const TurndownService = require('turndown')
const turndownService = new TurndownService()

const one = false

turndownService.addRule('blockquote removal', {
  filter: 'blockquote',
  replacement: function(content) {
    return content
  },
})

// const letters = _.range('A'.charCodeAt(0), 'W'.charCodeAt(0) + 1).map(i => String.fromCharCode(i))
// letters.push('XYZ')
// console.log(letters)

// axios({
//   method: 'get',
//   url: 'http://www.harrier.net/songbook/A/index.html',
//   responseType: 'stream'
// })
//   .then(function (response) {
//     response.data.pipe(fs.createWriteStream('result/A/index.html'))
//   })


let $ = cheerio.load(fs.readFileSync('result/A/index.html'))
const urls = []
$('ol li a').each(function() {
  const url = $(this).attr('href')
  urls.push(url)
})

// urls.forEach(function(url) {
//   axios({
//     method: 'get',
//     url: `http://www.harrier.net/songbook/A/${url}`,
//     responseType: 'stream'
//   })
//     .then(function (response) {
//       response.data.pipe(fs.createWriteStream(`result/A/${url}`))
//     })
// })

if (one) {
  console.log(getSong(`result/A/${urls[0]}`))
} else {
  urls.forEach(function(url) {
    console.log(getSong(`result/A/${url}`))
  })
}

function getSong(filename) {
  const fileContent = fs.readFileSync(filename, {encoding: 'utf8'})
  let markdown = turndownService.turndown(fileContent)

  // markdown = markdown.replaceAll(/$>\w/, '');

  let [title, mainContent] = markdown.split(/=.+/)
  title = title.match(/\*\*(.+)\*\*/)[1]

  let tune = null
  let tuneReplacer = function (match, p1) {
    tune = p1
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
  tune = tune.trim()

  return {
    title,
    mainContent,
    keywords,
    tune,
    filename,
  }
}