// ==================================================================
// ============================ UTILS ===============================
// ==================================================================

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