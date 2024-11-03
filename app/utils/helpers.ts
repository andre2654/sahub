export function handleFile(
  capture: boolean,
  multiple: boolean = false,
  acceptTypes: string = '*'
): Promise<FileList> {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = acceptTypes

  if (capture) input.capture = 'user'
  if (multiple) input.multiple = true

  return new Promise((resolve, reject) => {
    input.onchange = async (event: Event) => {
      const target = event.target as HTMLInputElement

      if (target?.files && target.files.length > 0) {
        const inputFiles = target.files as FileList

        input.remove()
        resolve(inputFiles)
      } else {
        input.remove()
        reject()
      }
    }

    input.click()
  })
}