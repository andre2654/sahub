import { Repository } from '@/types/general'

export default defineEventHandler(async (event) => {
  const token = getHeader(event, 'Authorization')

  const url = `https://api.github.com/user/repos`

  try {
    const repositories = await $fetch(url,
      {
        headers: {
          Authorization: token
        }
      }) as Repository[]

    return {
      statusCode: 200,
      data: repositories
    }

  } catch (error) {
    throw createError({
      statusCode: 404,
      message: `Error fetching repositories: ${error}`,
    })
  }
})