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
  const folderPath = `output/${letter}`

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
  const indexFilename = `output/${letter}/index.html`
  let $ = cheerio.load(fs.readFileSync(indexFilename))

  const songUris = []

  $('ol li a').each((i, e) => {
    const uri = $(e).attr('href')
    songUris.push(uri)
  })

  return songUris
}

async function downloadSongs(letter) {
  const songs = []
  const songUris = parseSongUris(letter)

  const promises = songUris.map(async (songUri) => {
    const songFilename = `output/${letter}/${songUri}`
    const url = `http://www.harrier.net/songbook/${letter}/${songUri}`

    await downloadIfNotExist(songFilename, url)
    const song = parseSong(songFilename)
    if (song) {
      song.url = url
      songs.push(song)
    }
  })
  await Promise.all(promises)

  return songs
}

async function run() {
  let allSongs = []

  const promises = letters().map(async (letter) => {
    await downloadIndex(letter)
    allSongs.push(await downloadSongs(letter))
  })
  await Promise.all(promises)

  allSongs = _.flatten(allSongs)

  fs.writeFileSync('output/songs.json', JSON.stringify(allSongs));
}

run()