// ==================================================================
// ============================ UTILS ===============================
// ==================================================================

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

/**
 * @author André Saraiva
 * @description Copy text to clipboard
 * @fileExtension ts
 * @operatingSystem MacOs
 * @link https://github.com/andre2654/sahub/blob/main/snippets/clipboard.ts
 * @tags copy, clipboard, text, typescript, javascript
 */
export function copyToClipboard(text: string): void {
  const input = document.createElement('input')
  input.value = text
  document.body.appendChild(input)
  input.select()
  document.execCommand('copy')
  document.body.removeChild(input)
}

/**
 * @author André Saraiva
 * @description Copy text to clipboard using navigator clipboard
 * @fileExtension ts
 * @operatingSystem MacOs
 * @link https://github.com/andre2654/sahub/blob/main/snippets/clipboard.ts
 * @tags copy, clipboard, text, typescript, javascript, navigator
 */
export function copyToClipboardNavigator(text: string): void {
  navigator.clipboard.writeText(text)
}

/**
 * @description Copy text to clipboard using document.execCommand
 * @link https://github.com/andre2654/sahub/blob/main/snippets/clipboard.ts
 * @tags copy, clipboard, text, typescript, javascript, document.execCommand
 */
export function copyToClipboardDocument(text: string): void {
  const input = document.createElement('input')
  input.value = text
  document.body.appendChild(input)
  input.select()
  document.execCommand('copy')
  document.body.removeChild(input)
}