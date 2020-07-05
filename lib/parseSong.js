const _ = require('lodash')
const fs = require('fs')
const cheerio = require('cheerio')
const TurndownService = require('turndown')
const turndownService = new TurndownService()

turndownService.addRule('blockquote removal', {
  filter: 'blockquote',
  replacement: function (content) {
    return content
  },
})
turndownService.addRule('link removal', {
  filter: 'a',
  replacement: function (content) {
    return content
  },
})
turndownService.addRule('bold removal', {
  filter: 'b',
  replacement: function (content) {
    return content
  },
})
turndownService.addRule('bold removal', {
  filter: 'strong',
  replacement: function (content) {
    return content
  },
})
turndownService.addRule('italic removal', {
  filter: 'i',
  replacement: function (content) {
    return content
  },
})

exports.parseSong = function(filename) {
  const fileContent = fs.readFileSync(filename, {encoding: 'utf8'})
  const $ = cheerio.load(fileContent)
  let markdown = turndownService.turndown(fileContent)

  // markdown = markdown.replaceAll(/$>\w/, '')
  let title = $('h1').text()
  title = _.replace(title, /\s+/g, ' ')
  title = title.trim()

  let mainContent = markdown.split(/=.+/)[1]

  if (!mainContent) {
    console.log(`unable to parse ${filename}, skipping.`)
    return null
  }

  let metadata = {}
  let metadataReplacer = function (match, p1) {
    let {name, value} = match.match(/(?<name>.+)\s*:\s*(?<value>.*)/i).groups
    name = name.trim().toLowerCase()
    value = value.trim()

    const allowed = ['tune', 'keywords', 'from', 'by', 'note']
    if (!_.includes(allowed, name)) {
      return match
    }

    metadata[name] = value
    return ''
  }
  mainContent = mainContent.replace(/^.+:.*\n?/igm, metadataReplacer)

  mainContent = mainContent.trim()

  return {
    title,
    mainContentMarkdown: mainContent,
    metadata,
  }
}
