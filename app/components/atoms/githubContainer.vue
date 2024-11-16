<template>
    <div class="flex w-[400px] flex-col overflow-hidden rounded-md border">
        <div class="bg-primary p-2">
            <IconGithub class="mx-auto h-[40px] w-[40px] fill-[#FBFBFB]" />
        </div>
        <div
            class="no-scrollbar flex max-h-[300px] w-full flex-col items-center gap-3 overflow-y-auto p-3"
        >
            <div class="text-primary text-xl uppercase">{{ title }}</div>
            <div class="flex flex-col gap-2">
                <slot />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import IconGithub from '@/public/icons/icon-github.svg'

defineProps<{
    title: string
}>()
</script>
