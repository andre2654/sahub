import type { User, Repository } from '@/types/general'

export const useUserStore = defineStore('user', {
    state: (): {
        user: User
        auth: {
            code: string
            accessToken: string
        }
        repositories: Repository[]
    } => {
        return {
            user: {
                id: null,
                name: '',
                avatar: ''
            },
            auth: {
                code: '',
                accessToken: ''
            },
            repositories: []
        }
    },
    actions: {
        setUserInfo(user: User, code: string, accessToken: string) {
            this.user = user
            this.auth.code = code
            this.auth.accessToken = accessToken
        },
        setRepositories(repositories: Repository[]) {
            this.repositories = repositories
        }
    },
    persist: [{
        key: 'user',
        pick: ['user'],
        storage: persistedState.localStorage
    }, {
        key: 'auth',
        pick: ['auth'],
        storage: persistedState.localStorage
    }, {
        key: 'repositories',
        pick: ['repositories'],
        storage: persistedState.localStorage
    }]
})
