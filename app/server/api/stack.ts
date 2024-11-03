import type { stackOverflowQuestion } from '@/types/general'
import neo4j from 'neo4j-driver'

export default defineEventHandler(async (event) => {
  const { query } = getQuery(event)

  // Database connection variables
  const URI = process.env.DATABASE_URL
  const USER = process.env.DATABASE_USER
  const PASSWORD = process.env.DATABASE_PASSWORD

  const url = `https://api.stackexchange.com/search/advanced?site=stackoverflow.com&pagesize=10&q=${query}`
  let driver, session

  const response = await fetch(url)
  const data = await response.json()
  const items: stackOverflowQuestion[] = data.items

  if (!items) {
    throw createError({
      statusCode: 404,
      message: `No items found for query: ${query}`
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

  // For each item
  for (const questionItem of items) {
    if (!questionItem.owner.user_type || questionItem.owner.user_type === 'does_not_exist') {
      continue
    }

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
        authorName: questionItem.owner.display_name,
        accountId: questionItem.owner.account_id,
        authorId: questionItem.owner.user_id,
        authorLink: questionItem.owner.link,
        tags: questionItem.tags,
        title: questionItem.title,
        link: questionItem.link
      })
    })

    console.log(`Successfully uploaded question: ${questionItem.title}`)
  }

  await session.close()
  await driver.close()

  return {
    statusCode: 200,
    message: `Successfully uploaded ${items.length} items to the database`
  }
})