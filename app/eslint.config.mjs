import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    'no-console': 'warn',
    'vue/multi-word-component-names': 'off',
    'vue/prefer-true-attribute-shorthand': 1,
    'vue/html-self-closing': 'off',
    'vue/no-multiple-template-root': 'off',
  },
})
