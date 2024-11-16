import { promises as fs } from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import type { Sahub } from '@/types/general'
import neo4j from 'neo4j-driver'

export default defineEventHandler(async (event) => {
  const token = getHeader(event, 'Authorization');
  const { owner, repository } = await readBody(event);

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

  const extractPath = path.resolve(`./${repository.id}`);
  const zipFilePath = path.resolve(`./${repository.id}.zip`);

  const url = `https://api.github.com/repos/${owner.username}/${repository.name}/zipball`;

  try {
    const response = await $fetch.raw(url, {
      headers: {
        Authorization: token
      },
      responseType: 'arrayBuffer',
    });

    if (response.status !== 200) {
      throw new Error(`Failed to download repository: ${response.statusText}`);
    }

    await fs.writeFile(zipFilePath, Buffer.from(response._data), 'binary');
    console.log(`File saved successfully to ${zipFilePath}`);

    const zip = new AdmZip(zipFilePath);
    zip.extractAllTo(extractPath, true);
    console.log(`Extracted ZIP to ${extractPath}`);

    const extractedEntries = zip.getEntries();
    for (const entry of extractedEntries) {
      if (entry.isDirectory) continue
      const content = entry.getData().toString('utf-8')
      const fileName = entry.entryName
      const path = fileName.split('/').slice(1).join('/')
      const extensionOnFile = fileName?.split('.').pop() || 'not-found'

      const comments = content.match(regexs.comments)

      if (!comments) continue

      comments.forEach((comment: string) => {
        const sahub = {} as Sahub

        const author = comment.match(regexs.author)
        const description = comment.match(regexs.description)
        const deprecated = comment.match(regexs.deprecated)
        const fileExtension = comment.match(regexs.fileExtension)
        const operatingSystem = comment.match(regexs.operatingSystem)
        const repositoryPath = path
        const tags = comment.match(regexs.tags)

        const startIndex = content.indexOf(comment)
        const lineStart = content.substring(0, startIndex).split('\n').length
        const endIndex = lineStart + comment.split('\n').length

        sahub.author = author ? author[1].trim() : owner.name
        sahub.authorUsername = owner.username
        sahub.description = description ? description[1].trim() : ''
        sahub.deprecated = deprecated ? true : false
        sahub.fileExtension = fileExtension ? fileExtension[1].trim() : extensionOnFile
        sahub.operatingSystem = operatingSystem ? operatingSystem[1].trim() : 'not-found'
        sahub.repositoryId = repository.id
        sahub.repositoryName = repository.name
        sahub.repositoryPath = repositoryPath
        sahub.link = `https://github.com/${owner.username}/${repository.name}/blob/main/${repositoryPath}`
        sahub.tags = tags ? tags[1].trim().replace(/\s*,\s*/g, ';').split(';') : []
        sahub.content = content
        sahub.lineStart = endIndex

        sahubs.push(sahub)
      })
    }

    await fs.unlink(zipFilePath);
    console.log(`Removed ZIP file: ${zipFilePath}`);

    const removeDirectory = async (dirPath: string) => {
      const files = await fs.readdir(dirPath);
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stat = await fs.stat(filePath);
        if (stat.isDirectory()) {
          await removeDirectory(filePath);
        } else {
          await fs.unlink(filePath);
        }
      }
      await fs.rmdir(dirPath);
    };

    await removeDirectory(extractPath);
    console.log(`Removed extracted folder: ${extractPath}`);

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
          
            // Create or Merge Operating System
            MERGE (os:OperatingSystem {name: $operatingSystem})
          
            // Create or Merge Author
            MERGE (a:Author {
              name: $author,
              username: $authorUsername
            })

            // Create or Merge Repository
            MERGE (r:Repository {
              id: $repositoryId,
              name: $repositoryName
            })
          
            // Create File
            MERGE (f:File {
              content: $content,
              link: 'teste'
            })
          
            // Create Snippet
            CREATE (s:Snippet {
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
          
            // Connect Snippet to File, Author, Extension, and Operating System
            MERGE (s)-[:AUTHORED_BY]->(a)
            MERGE (s)-[:IN_FILE]->(f)
            MERGE (f)-[:IN_REPOSITORY]->(r)
            MERGE (s)-[:USES_EXTENSION]->(e)
            MERGE (s)-[:FOR_OS]->(os)
          `, {
          tags: sahub.tags,
          fileExtension: sahub.fileExtension,
          operatingSystem: sahub.operatingSystem,
          author: sahub.author,
          authorUsername: sahub.authorUsername,
          content: sahub.content,
          description: sahub.description,
          deprecated: sahub.deprecated,
          link: sahub.link,
          lineStart: sahub.lineStart,
          repositoryId: sahub.repositoryId,
          repositoryName: sahub.repositoryName
        })

        console.log(`Successfully uploaded snippet: ${sahub.description}`)
      })
    }
    await session.close()
    await driver.close()

    return { message: 'Repository processed successfully' };
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: `Error processing repository: ${error}`,
    });
  }
});
