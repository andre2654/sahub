<template>
    <div class="flex min-h-screen w-full flex-col gap-[150px]">
        <AtomsHeader />
        <div class="mx-auto flex flex-col gap-3">
            <AtomsGithubContainer
                v-if="userStore.user.id"
                title="Selecione um repositório"
            >
                <AtomsRepositoryButton
                    v-for="repository in userStore.repositories"
                    class="w-full"
                    :key="repository.id"
                    :name="repository.name"
                    :already-selected="
                        userRepositories.some(
                            (repo) => repo.repositoryId === repository.id
                        )
                    "
                    @click="uploadRepository(repository.id, repository.name)"
                />
            </AtomsGithubContainer>

            <a v-else :href="githubLink">
                <AtomsGithubContainer
                    title="Entre com seu github"
                    class="cursor-pointer"
                />
            </a>

            <button
                class="text-sm text-gray-600 hover:underline"
                @click="handleFileUpload"
            >
                OU CLIQUE AQUI PARA ENVIAR UM ARQUIVO
            </button>
        </div>
        <AtomsFooter />
    </div>
</template>

<script setup lang="ts">
import { handleFile } from '@/utils/helpers'

const { showGlobalLoading, hideGlobalLoading } = useInterfaceStore()
const userStore = useUserStore()
const { githubClientId } = useRuntimeConfig().public

const githubLink = computed(() => {
    return `https://github.com/login/oauth/authorize?client_id=${githubClientId}&redirect_uri=http://localhost:3000/callback&scope=repo
`
})

const handleFileUpload = async () => {
    showGlobalLoading()
    const files = await handleFile(true, true, '*')

    const formData = new FormData()
    for (let i = 0; i < files.length; i++) {
        formData.append(`file_${i}`, files[i])
    }

    const response = await $fetch('/api/upload', {
        method: 'POST',
        body: formData,
    })

    hideGlobalLoading()
    alert('Arquivo enviado com sucesso!')
}

const userRepositories = ref([])
const getRepositories = async () => {
    showGlobalLoading()

    const response = await $fetch(
        `/api/github/getRepos?username=${userStore.user.username}`
    )

    userRepositories.value = response.body.data
    hideGlobalLoading()
}

const uploadRepository = async (repoId: number, repoName: string) => {
    showGlobalLoading()

    const accessToken = userStore.auth.accessToken

    const response = await $fetch('/api/github/upload', {
        method: 'POST',
        body: {
            repository: {
                id: repoId,
                name: repoName,
            },
            owner: userStore.user,
        },
        headers: {
            Authorization: `bearer ${accessToken}`,
        },
    })

    if (response) {
        userRepositories.value.push({
            repositoryId: repoId,
            repositoryName: repoName,
        })
    }

    hideGlobalLoading()
    alert('Repositorio enviado com sucesso!')
}

onMounted(() => {
    if (userStore.user.id && userStore.user.username) {
        getRepositories()
    }
})
</script>
