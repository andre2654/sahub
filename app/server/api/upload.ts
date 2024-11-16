import type { Sahub } from '@/types/general'
import { readMultipartFormData } from 'h3'
import neo4j from 'neo4j-driver'

export default defineEventHandler(async (event) => {
  const files = await readMultipartFormData(event)

  // Database connection variables
  const URI = process.env.DATABASE_URL
  const USER = process.env.DATABASE_USER
  const PASSWORD = process.env.DATABASE_PASSWORD

  const sahubs = [] as Sahub[]
  let driver, session

  const regexs = {
    comments: /\/\*\*.*?@tags.*?\*\//gs,
    author: /@author\s*(.*?\n)/i,
    description: /@description\s*(.*?\n)/i,
    deprecated: /@deprecated\s*(.*?\n)/i,
    fileExtension: /@fileExtension\s*(.*?\n)/i,
    operatingSystem: /@operatingSystem\s*(.*?\n)/i,
    link: /@link\s*(.*?\n)/i,
    tags: /@tags\s*(.*?\n)/i,
  }

  for (const file of files) {
    const content = file.data.toString('utf-8')
    const extensionOnFile = file?.filename?.split('.').pop() || 'not-found'

    const comments = content.match(regexs.comments)

    if (!comments) continue

    comments.forEach((comment: string) => {
      const sahub = {} as Sahub

      const author = comment.match(regexs.author)
      const description = comment.match(regexs.description)
      const deprecated = comment.match(regexs.deprecated)
      const fileExtension = comment.match(regexs.fileExtension)
      const operatingSystem = comment.match(regexs.operatingSystem)
      const link = comment.match(regexs.link)
      const tags = comment.match(regexs.tags)

      const startIndex = content.indexOf(comment)
      const lineStart = content.substring(0, startIndex).split('\n').length
      const endIndex = lineStart + comment.split('\n').length

      sahub.author = author ? author[1].trim() : null
      sahub.description = description ? description[1].trim() : ''
      sahub.deprecated = deprecated ? true : false
      sahub.fileExtension = fileExtension ? fileExtension[1].trim() : extensionOnFile
      sahub.operatingSystem = operatingSystem ? operatingSystem[1].trim() : null
      sahub.link = link ? link[1].trim() : ''
      sahub.tags = tags ? tags[1].trim().replace(/\s*,\s*/g, ';').split(';') : []
      sahub.content = content
      sahub.lineStart = endIndex

      sahubs.push(sahub)
    })

    if (!sahubs.length) {
      throw createError({
        statusCode: 404,
        message: `No comment valid sintaxe found`
      })
    }

    try {
      driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD))
      await driver.verifyConnectivity()
    } catch (err) {
      console.log(`-- Connection error --\n${err}\n-- Cause --\n${err.cause}`)
      await driver.close()
      return
    }

    session = driver.session({ database: 'neo4j' })

    // For each sahub
    for (const sahub of sahubs) {
      const result = await session.executeWrite(async tx => {
        await tx.run(`
          // Create or Merge Extension
          MERGE (e:Extension {name: $fileExtension})
        
          // Create File
          MERGE (f:File {
            content: $content,
            link: 'teste'
          })
        
          // Create Snippet
          MERGE (s:Snippet {
            description: $description,
            deprecated: $deprecated,
            link: $link,
            startsAt: $lineStart
          })

          // Connect Snippet to Tags
          FOREACH(tag in $tags |
            MERGE (t:Tag {name: tag})
            MERGE (s)-[:TAGGED]->(t)
          )

          // Create or Merge Author
          FOREACH (_ IN CASE WHEN $author IS NOT NULL THEN [1] ELSE [] END |
            MERGE (a:Author {name: $author})
            MERGE (s)-[:AUTHORED_BY]->(a)
          )

          // Create or Merge Operating System
          FOREACH (_ IN CASE WHEN $operatingSystem IS NOT NULL THEN [1] ELSE [] END |
            MERGE (os:OperatingSystem {name: $operatingSystem})
            MERGE (s)-[:FOR_OS]->(os)
          )
        
          // Connect Snippet to File, Author, Extension, and Operating System
          MERGE (s)-[:IN_FILE]->(f)
          MERGE (s)-[:USES_EXTENSION]->(e)
        `, {
          tags: sahub.tags,
          fileExtension: sahub.fileExtension,
          operatingSystem: sahub.operatingSystem,
          author: sahub.author,
          content: sahub.content,
          description: sahub.description,
          deprecated: sahub.deprecated,
          link: sahub.link,
          lineStart: sahub.lineStart
        }).catch(err => {
          console.log(`-- Error --\n${err}`)
        })

        console.log(`Successfully uploaded snippet: ${sahub.description}`)
      })
    }
    await session.close()
    await driver.close()

    return {
      statusCode: 200,
      message: `Successfully uploaded ${sahubs.length} items to the database`
    }
  }
})