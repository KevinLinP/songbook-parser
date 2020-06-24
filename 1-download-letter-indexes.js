const _ = require('lodash')
const fs = require('fs')
const fsPromises = fs.promises
const axios = require('axios')
const cheerio = require('cheerio')

function letters() {
  const letters = _.range('A'.charCodeAt(0), 'W'.charCodeAt(0) + 1).map(i => String.fromCharCode(i))
  letters.push('XYZ')

  return letters
}

async function downloadIfNotExist(filename, url) {
  await fsPromises.access(filename).catch(async function () {
    await axios({
      method: 'get',
      url: url,
      responseType: 'stream'
    }).then(function (response) {
      response.data.pipe(fs.createWriteStream(filename))
    })
  })

  return filename
}

async function downloadIndex(letter) {
  const folderPath = `html/${letter}`
  const indexFilename = folderPath + '/index.html';
  const url = `http://www.harrier.net/songbook/${letter}/index.html`

  await fsPromises.access(folderPath).catch(() => {
    return fsPromises.mkdir(folderPath)
  })

  await downloadIfNotExist(indexFilename, url)

  return indexFilename
}

async function downloadSongs(letter) {
  const indexFilename = `html/${letter}/index.html`
  let $ = cheerio.load(fs.readFileSync(indexFilename))

  const songUris = []

  $('ol li a').each(function() {
    const uri = $(this).attr('href')
    songUris.push(uri)
  })

  const songFilenames = []

  await Promise.all(songUris.map(async (songUri) => {
    const songFilename = `html/${letter}/${songUri}`
    const url = `http://www.harrier.net/songbook/${letter}/${songUri}`

    songFilenames.push(songFilename)
    await downloadIfNotExist(songFilename, url)
  }));

  return songFilenames
}

letters().forEach(async function (letter) {
  await downloadIndex(letter)
  const songFilenames = await downloadSongs(letter)

  console.log(songFilenames)
})