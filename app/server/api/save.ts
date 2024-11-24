import neo4j from 'neo4j-driver'

export default defineEventHandler(async (event) => {
  const {
    authorName,
    accountId,
    authorId,
    authorLink,
    tags,
    title,
    link
  } = getQuery(event)

  if (!authorName || !accountId || !authorId || !authorLink || !tags || !title || !link) {
    throw createError({
      statusCode: 404,
      message: `Missing required fields`
    })
  }

  const URI = process.env.DATABASE_URL
  const USER = process.env.DATABASE_USER
  const PASSWORD = process.env.DATABASE_PASSWORD
  let driver, session

  const tagsSplitted = tags.toString().split(',')

  try {
    driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD))
    await driver.verifyConnectivity()
  } catch (err) {
    console.log(`-- Connection error --\n${err}\n-- Cause --\n${err.cause}`)
    await driver.close()
    return
  }

  session = driver.session({ database: 'neo4j' })

  const result = await session.executeWrite(async tx => {
    await tx.run(`
      // Create or Merge Author
      MERGE (a:Author {
        name: $authorName,
        accountId: $accountId,
        userId: $authorId,
        link: $authorLink
      })
    
      // Create Question
      MERGE (q:Question {
        description: $title,
        link: $link
      })

      // Connect Snippet to Tags
      FOREACH(tag in $tags |
        MERGE (t:Tag {name: tag})
        MERGE (q)-[:TAGGED]->(t)
      )
    
      // Connect Snippet to File, Author, Extension, and Operating System
      MERGE (q)-[:AUTHORED_BY]->(a)
    `, {
      authorName,
      accountId,
      authorId,
      authorLink,
      tags: tagsSplitted,
      title,
      link,
    })

    console.log(`Successfully uploaded question: ${title}`)
  })

  await session.close()
  await driver.close()

  return {
    statusCode: 200,
    message: `Successfully uploaded ${title} question`
  }
})