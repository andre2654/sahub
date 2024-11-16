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

    if (!query.username) {
        throw createError({
            statusCode: 400,
            message: 'No username provided'
        })
    }

    const username = query.username.toString()

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
        const repositories = await tx.run(`
        MATCH (s:Snippet)-[:AUTHORED_BY]->(a:Author)
        WHERE a.username = $username
        WITH DISTINCT s
        MATCH (s)-[:IN_FILE]->(f:File)-[:IN_REPOSITORY]->(r:Repository)
        RETURN DISTINCT r.id AS repositoryId,
                        r.name AS repositoryName
        ORDER BY r.name
    `, {
            username
        })

        return repositories.records.map(record => record.toObject())
    })
    console.log(`Successfully found ${result.length} repositories`)

    await session.close()
    await driver.close()

    return {
        statusCode: 200,
        body: {
            data: result
        }
    }
})