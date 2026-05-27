export function trimStrings<T extends object>(obj: T): T {
  if (typeof obj !== 'object' || obj === null) return obj
  if (Array.isArray(obj)) {
    return obj.map(item =>
      typeof item === 'object' && item !== null ? trimStrings(item) : item
    ) as unknown as T
  }
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = value.trim()
    } else if (typeof value === 'object' && value !== null) {
      result[key] = trimStrings(value as object)
    } else {
      result[key] = value
    }
  }
  return result as T
}
