<template>
    <AtomsLoading v-if="interfaceStore.isGlobalLoading" />
    <NuxtPage />
</template>

<script setup lang="ts">
const interfaceStore = useInterfaceStore()
</script>
