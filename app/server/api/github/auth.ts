export default defineEventHandler(async (event) => {
    const { code } = getQuery(event)

    const { githubClientId } = useRuntimeConfig().public
    const { githubClientSecret } = useRuntimeConfig().private

    const authUrl = `https://github.com/login/oauth/access_token?client_id=${githubClientId}&client_secret=${githubClientSecret}&code=${code}`
    const userUrl = `https://api.github.com/user`

    const authResponse = await $fetch(authUrl, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
    }) as Response

    if ((authResponse?.error && authResponse?.error_description) || !authResponse?.access_token) {
        throw createError({
            statusCode: 500,
            message: `Error authenticating with GitHub: ${authResponse.error_description}`,
        })
    }

    try {
        const userResponse = await $fetch(userUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                Authorization: `bearer ${authResponse.access_token}`
            }
        }) as Response

        return {
            statusCode: 200,
            data: {
                user: {
                    id: userResponse.id,
                    username: userResponse.login,
                    name: userResponse.name,
                    avatar: userResponse.avatar_url
                },
                accessToken: authResponse.access_token
            }
        }
    } catch (error) {
        throw createError({
            statusCode: 500,
            message: `Error fetching user: ${error}`,
        })
    }
})