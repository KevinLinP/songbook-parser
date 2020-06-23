const _ = require('lodash')
const fs = require('fs')
const axios = require('axios')
const cheerio = require('cheerio')

// const letters = _.range('A'.charCodeAt(0), 'W'.charCodeAt(0) + 1).map(i => String.fromCharCode(i));
// letters.push('XYZ');
// console.log(letters);

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
  const url = $(this).attr('href');
  urls.push(url);
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
// });

urls.forEach(function(url) {
  console.log(getSong(`result/A/${url}`))
})

function getSong(filename) {
  $ = cheerio.load(fs.readFileSync(filename))

  const title = $('h1').text()

  let tune = null
  let keywords = null
  const lyrics = []

  $('p').each(function() {
    const text = $(this).text().trim()

    if (text.match(/Tune:/i)) {
      tune = text
    } else if (text.match(/keywords:/i)) {
      keywords = text
    } else {
      lyrics.push(text)
    }
  })

  return {
    title,
    keywords,
    tune,
    filename,
    lyrics,
  }
}