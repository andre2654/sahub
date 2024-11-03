/**
 * @author André Saraiva
 * @description Copy text to clipboard
 * @fileExtension ts
 * @operatingSystem MacOs
 * @tutorial https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand
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
 * @tutorial https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString
 * @tags date, iso, format, javascript
 */
export function getCurrentDate(): string {
  return new Date().toISOString()
}