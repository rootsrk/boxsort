/**
 * Bauhaus-inspired color palette for type tags
 * These colors are chosen for visual harmony and accessibility
 */
export const TYPE_COLORS = [
  '#E53935', // Bauhaus Red
  '#1E88E5', // Bauhaus Blue
  '#FDD835', // Bauhaus Yellow
  '#43A047', // Green
  '#8E24AA', // Purple
  '#FB8C00', // Orange
  '#00ACC1', // Cyan
  '#7CB342', // Light Green
  '#F4511E', // Deep Orange
  '#5E35B1', // Deep Purple
  '#00897B', // Teal
  '#C0CA33', // Lime
] as const

export type TypeColor = (typeof TYPE_COLORS)[number]

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
 * Get a deterministic color for a type name
 * The same name will always produce the same color
 * @param typeName - The name of the type
 * @returns A hex color code
 */
export function getTypeColor(typeName: string): TypeColor {
  const normalizedName = typeName.toLowerCase().trim()
  const hash = hashString(normalizedName)
  const index = hash % TYPE_COLORS.length
  return TYPE_COLORS[index]
}

/**
 * Get a color by index (for manual color selection)
 * @param index - The index in the color palette
 * @returns A hex color code
 */
export function getColorByIndex(index: number): TypeColor {
  return TYPE_COLORS[index % TYPE_COLORS.length]
}

/**
 * Get all available type colors
 * @returns Array of all color options
 */
export function getAllTypeColors(): readonly TypeColor[] {
  return TYPE_COLORS
}

/**
 * Check if a color is a valid type color
 * @param color - The color to check
 * @returns True if the color is valid
 */
export function isValidTypeColor(color: string): color is TypeColor {
  return TYPE_COLORS.includes(color as TypeColor)
}

/**
 * Get contrasting text color (black or white) for a background color
 * @param hexColor - The background hex color
 * @returns '#000000' for light backgrounds, '#FFFFFF' for dark backgrounds
 */
export function getContrastingTextColor(hexColor: string): '#000000' | '#FFFFFF' {
  // Remove # if present
  const hex = hexColor.replace('#', '')

  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  // Return black for light backgrounds, white for dark
  return luminance > 0.5 ? '#000000' : '#FFFFFF'
}

