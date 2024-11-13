<template>
  <div class="min-h-screen w-full flex flex-col gap-[150px]">
    <header class="w-full justify-end flex">
      <img src="/images/logo.svg" alt="Logo" class="w-[95%] sm:w-[90%] md:w-[80%] lg:w-[70%] xl:w-[60%] h-auto" />
    </header>
    <div class="flex flex-col w-full justify-center items-center gap-2">
      <div class="uppercase opacity-60">Clique abaixo para salvar um arquivo</div>
      <button @click="handleFileUpload" class="text-[#1c75d0] border-[3px] border-[#1c75d0] py-2 w-full md:w-[400px] text-[30px] uppercase">Enviar arquivo</button>
    </div>
    <div class="w-full bg-[#1c75d0] min-h-[300px] p-[20px] flex flex-col gap-[100px]">
      <div class="flex flex-col">
        <h2 class="text-white text-[110px] uppercase leading-[90px]">Detalhes</h2>
      <h3 class="text-white text-[55px] uppercase leading-[55px]">De sintaxe</h3>
      </div>

      <code class="text-white">
        @author André Saraiva
        <br/>
        @description Copy text to clipboard
        <br/>
        @fileExtension ts
        <br/>
        @operatingSystem MacOs
        <br/>
        @tutorial link
        <br/>
        @tags copy, clipboard, text, typescript, javascript
      </code>
    </div>
  </div>
</template>

<script setup lang="ts">
import { handleFile } from '@/utils/helpers'

const handleFileUpload = async () => {
  const files = await handleFile(true, true, '*')

  const formData = new FormData()
  for(let i = 0; i < files.length; i++) {
    formData.append(`file_${i}`, files[i])
  }

  const response = await $fetch('/api/upload', {
    method: 'POST',
    body: formData
  })

  alert('Arquivo enviado com sucesso!')
}
</script>