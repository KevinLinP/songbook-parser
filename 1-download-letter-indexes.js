// sorry this is so complex. I'm practicing async JS

const _ = require('lodash')
const fs = require('fs')
const fsPromises = fs.promises
const axios = require('axios')
const cheerio = require('cheerio')

const parseSong = require('./lib/parseSong').parseSong

const one = false
const skipWeb = true

function letters() {
  if (one) {
    return ['A']
  } else {
    const letters = _.range('A'.charCodeAt(0), 'W'.charCodeAt(0) + 1).map(i => String.fromCharCode(i))
    letters.push('XYZ')

    return letters
  }
}

async function downloadIfNotExist(filename, url) {
  try {
    await fsPromises.access(filename)
  } catch {
    if (!skipWeb) {
      const response = await axios({
        method: 'get',
        url: url,
        responseType: 'stream'
      })

      await response.data.pipe(fs.createWriteStream(filename))
    }
  }

  return filename
}

async function downloadIndex(letter) {
  const folderPath = `html/${letter}`

  try {
    await fsPromises.access(folderPath)
  } catch {
    await fsPromises.mkdir(folderPath)
  }

  const indexFilename = folderPath + '/index.html'
  const url = `http://www.harrier.net/songbook/${letter}/index.html`

  await downloadIfNotExist(indexFilename, url)

  return indexFilename
}

function parseSongUris(letter) {
  const indexFilename = `html/${letter}/index.html`
  let $ = cheerio.load(fs.readFileSync(indexFilename))

  const songUris = []

  $('ol li a').each((i, e) => {
    const uri = $(e).attr('href')
    songUris.push(uri)
  })

  return songUris
}

async function downloadSongs(letter) {
  const songFilenames = []
  const songUris = parseSongUris(letter)

  const promises = songUris.map(async (songUri) => {
    const songFilename = `html/${letter}/${songUri}`
    const url = `http://www.harrier.net/songbook/${letter}/${songUri}`

    songFilenames.push(songFilename)
    await downloadIfNotExist(songFilename, url)
    console.log(parseSong(songFilename))
  })
  await Promise.all(promises)

  return songFilenames
}

async function run() {
  let allSongFilenames = []

  const promises = letters().map(async (letter) => {
    await downloadIndex(letter)
    const songFilenames = await downloadSongs(letter)

    allSongFilenames += songFilenames
  })
  await Promise.all(promises)

  console.log(allSongFilenames)
}

run()