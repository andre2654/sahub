import svgLoader from 'vite-svg-loader'
import { defineNuxtConfig } from 'nuxt/config'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  css: ['~/assets/css/main.scss'],

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt'
  ],

  runtimeConfig: {
    public: {
      githubClientId: process.env.GITHUB_CLIENT_ID,
    },
    private: {
      githubClientSecret: process.env.GITHUB_CLIENT_SECRET,
    }
  },

  postcss: {
    plugins: {
      'tailwindcss/nesting': {},
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  vite: {
    plugins: [svgLoader()],
  },

  compatibilityDate: '2024-11-15',
})