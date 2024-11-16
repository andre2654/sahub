<template>
    <header
        class="flex w-full items-center justify-between gap-10 border-b bg-[#FBFBFB] px-5 py-3"
    >
        <IconLogo class="h-[50px] w-auto" />
        <div v-if="userStore.user.id" class="flex items-center gap-3">
            <div class="flex flex-col items-end">
                <div class="text-[18px]">{{ userStore.user.name }}</div>
                <div class="text-[15px] font-light">Conectado</div>
            </div>
            <div
                class="flex h-[55px] w-[55px] items-center justify-center rounded-full bg-black bg-cover"
                :style="{ backgroundImage: `url(${userStore.user.avatar})` }"
            >
                <IconGithub
                    v-if="!userStore.user.avatar"
                    class="h-[40px] w-[40px] fill-[#FBFBFB]"
                />
            </div>
        </div>
    </header>
</template>

<script setup lang="ts">
import IconLogo from '@/public/icons/icon-logo.svg'
import IconGithub from '@/public/icons/icon-github.svg'

const userStore = useUserStore()
</script>
