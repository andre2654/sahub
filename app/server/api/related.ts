import neo4j from 'neo4j-driver'

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, {
    "Access-Control-Allow-Methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "Access-Control-Allow-Origin": "*",
    'Access-Control-Allow-Credentials': 'true',
    "Access-Control-Allow-Headers": '*',
    "Access-Control-Expose-Headers": '*'
  })

  const query = getQuery(event)

  if (!query.tags) {
    throw createError({
      statusCode: 400,
      message: 'No tags provided'
    })
  }

  const tags = query.tags.toString().split(',')

  // Database connection variables
  const URI = process.env.DATABASE_URL
  const USER = process.env.DATABASE_USER
  const PASSWORD = process.env.DATABASE_PASSWORD

  let driver, session

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
  const result = await session.executeWrite(async tx => {
    const snippets = await tx.run(`
      MATCH (s:Snippet)-[:TAGGED]->(t:Tag)
      WHERE t.name IN $tags
      WITH s, COLLECT(t.name) AS relatedTags
      ORDER BY SIZE(relatedTags) DESC
      LIMIT 5
      OPTIONAL MATCH (s)-[:IN_FILE]->(f:File)
      RETURN
      s.description AS description,
      s.link AS link,
      s.startsAt AS startsAtLine,
      relatedTags AS tags,
      f { .link, .content } AS file
    `, {
      tags
    })

    const questions = await tx.run(`
      // Get Questions by Tags
      MATCH (q:Question)-[:TAGGED]->(t:Tag)
      WHERE t.name IN $tags
      WITH q, COLLECT(t.name) AS relatedTags
      ORDER BY SIZE(relatedTags) DESC
      LIMIT 5
      RETURN
      q.description AS description,
      q.link AS link,
      relatedTags AS tags
    `,
      {
        tags
      })

    return {
      snippets: snippets.records.map(record => record.toObject()),
      questions: questions.records.map(record => record.toObject())
    }
  })
  console.log(`Successfully found ${result.snippets.length} snippets`)
  console.log(`Successfully found ${result.questions.length} questions`)

  await session.close()
  await driver.close()

  return {
    statusCode: 200,
    body: {
      data: result
    }
  }
})