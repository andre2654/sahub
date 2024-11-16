<template>
    <button
        class="hover: flex flex-col items-center justify-center rounded-md border bg-[#F0F0F0] p-3"
        :class="{
            'pointer-events-none cursor-not-allowed opacity-60':
                alreadySelected,
        }"
    >
        <span class="font-medium uppercase">{{ name }}</span>
        <span v-if="alreadySelected" class="text-sm font-extralight"
            >Already connected</span
        >
    </button>
</template>

<script setup lang="ts">
defineProps<{
    name: string
    alreadySelected: boolean
}>()
</script>
