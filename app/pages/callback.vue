<template>
    <div class="flex min-h-screen w-full flex-col items-center justify-center">
        <IconLogo class="h-[50px] w-auto" />
        <div>Your code is</div>
        <div>{{ codeGithubFallback }}</div>
    </div>
</template>

<script setup lang="ts">
import IconLogo from '@/public/icons/icon-logo.svg'

const { showGlobalLoading, hideGlobalLoading } = useInterfaceStore()
const { setUserInfo, setRepositories } = useUserStore()
const route = useRoute()
const router = useRouter()

const codeGithubFallback = computed<string>(() => {
    return route.query.code as string
})

const authenticate = async () => {
    const response = await $fetch(
        `/api/github/auth?code=${codeGithubFallback.value}`
    )

    return response.data
}

const getRepositories = async (accessToken: string) => {
    const response = await $fetch('/api/github/repositories', {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })

    return response.data
}

onMounted(async () => {
    showGlobalLoading()

    const { user, accessToken } = await authenticate()
    const repositories = await getRepositories(accessToken)

    setUserInfo(user, codeGithubFallback.value, accessToken)
    setRepositories(repositories)

    hideGlobalLoading()

    router.push('/')
})
</script>
