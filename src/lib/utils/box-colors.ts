/**
 * Vibrant color palette for box cards
 * These colors are chosen for visual interest and variety
 */
const BOX_COLORS = [
  '#FF6B6B', // Coral Red
  '#4ECDC4', // Turquoise
  '#45B7D1', // Sky Blue
  '#FFA07A', // Light Salmon
  '#98D8C8', // Mint Green
  '#F7DC6F', // Golden Yellow
  '#BB8FCE', // Lavender
  '#85C1E2', // Light Blue
  '#F8B739', // Amber
  '#52BE80', // Emerald
  '#EC7063', // Pink Coral
  '#5DADE2', // Cornflower Blue
  '#F39C12', // Orange
  '#A569BD', // Purple
  '#48C9B0', // Aqua
  '#F1948A', // Salmon
  '#85C1E9', // Powder Blue
  '#F4D03F', // Canary Yellow
  '#82E0AA', // Light Green
  '#F5B7B1', // Rose
] as const

type BoxColor = (typeof BOX_COLORS)[number]

/**
 * Generate a deterministic hash from a string
 * @param str - The string to hash
 * @returns A numeric hash value
 */
function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

/**
 * Get a deterministic color for a box ID
 * The same box ID will always produce the same color
 * @param boxId - The ID of the box
 * @returns A hex color code
 */
export function getBoxColor(boxId: string): BoxColor {
  const hash = hashString(boxId)
  const index = hash % BOX_COLORS.length
  return BOX_COLORS[index]
}

/**
 * Get a lighter version of a color (for backgrounds)
 * @param hexColor - The hex color code
 * @param opacity - Opacity value (0-1)
 * @returns RGBA color string
 */
export function getLightColor(hexColor: string, opacity: number = 0.1): string {
  const hex = hexColor.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

