import { XMLParser } from 'fast-xml-parser'

async function debugRSS() {
  const url = 'https://v2ex.com/index.xml'
  console.log(`Fetching ${url}...`)

  try {
    const res = await fetch(url)
    const xml = await res.text()
    console.log('Fetched XML length:', xml.length)

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
    })
    const result = parser.parse(xml)
    console.log('Parsed structure keys:', Object.keys(result))

    if (result.feed) {
      console.log('Detected Atom feed')
      console.log('Entries count:', result.feed.entry?.length)
      if (result.feed.entry?.length > 0) {
        const entry = result.feed.entry[0]
        console.log('First entry title:', entry.title)
        console.log('First entry link:', JSON.stringify(entry.link, null, 2))
        console.log('First entry id:', entry.id)
        console.log('First entry updated:', entry.updated)
        console.log('First entry content type:', typeof entry.content)
        if (typeof entry.content === 'object') {
          console.log('First entry content keys:', Object.keys(entry.content))
        }
      }
    } else if (result.rss) {
      console.log('Detected RSS feed')
      console.log('Items count:', result.rss.channel?.item?.length)
      if (result.rss.channel?.item?.length > 0) {
        console.log('First item:', JSON.stringify(result.rss.channel.item[0], null, 2))
      }
    } else {
      console.log('Unknown feed format')
      console.log('Result:', JSON.stringify(result, null, 2))
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

debugRSS()
