export const useInterfaceStore = defineStore('interface', {
  state: (): {
    isGlobalLoading: boolean
  } => {
    return {
      isGlobalLoading: false
    }
  },
  actions: {
    hideGlobalLoading() {
      this.isGlobalLoading = false
    },
    showGlobalLoading() {
      this.isGlobalLoading = true
    }
  },
})
