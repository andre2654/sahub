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

/**
 * @description Read text from clipboard
 * @link https://github.com/andre2654/sahub/blob/main/snippets/clipboard.ts
 * @tags read, clipboard, text, typescript, javascript, navigator
 */
export function readFromClipboard(): Promise<string> {
  return navigator.clipboard.readText()
}

/**
 * @description Check if clipboard access is available
 * @link https://github.com/andre2654/sahub/blob/main/snippets/clipboard.ts
 * @tags clipboard, access, typescript, javascript, navigator
 */
export function isClipboardAccessAvailable(): boolean {
  return !!navigator.clipboard
}

/**
 * @description Copy HTML to clipboard
 * @link https://github.com/andre2654/sahub/blob/main/snippets/clipboard.ts
 * @tags copy, clipboard, html, typescript, javascript, navigator
 */
export function copyHtmlToClipboard(html: string): void {
  const blob = new Blob([html], { type: 'text/html' })
  const data = [new ClipboardItem({ 'text/html': blob })]
  navigator.clipboard.write(data)
}

/**
 * @description Copy image to clipboard
 * @link https://github.com/andre2654/sahub/blob/main/snippets/clipboard.ts
 * @tags copy, clipboard, image, typescript, javascript, navigator
 */
export function copyImageToClipboard(imageUrl: string): void {
  fetch(imageUrl)
    .then(response => response.blob())
    .then(blob => {
      const item = new ClipboardItem({ 'image/png': blob })
      navigator.clipboard.write([item])
    })
}

/**
 * @description Clear clipboard content
 * @link https://github.com/andre2654/sahub/blob/main/snippets/clipboard.ts
 * @tags clear, clipboard, typescript, javascript, navigator
 */
export function clearClipboard(): void {
  navigator.clipboard.writeText('')
}