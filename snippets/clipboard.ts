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
 * @description Get the current date in ISO format
 * @link https://github.com/andre2654/sahub/blob/main/snippets/clipboard.ts
 * @tags date, iso, format, javascript
 */
export function getCurrentDate(): string {
  return new Date().toISOString()
}