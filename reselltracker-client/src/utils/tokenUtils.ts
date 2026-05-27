export interface TokenPayload {
  sub: string
  email: string
  name: string
  role: string
  exp: number
  iss?: string
  aud?: string
}

export function getTokenPayload(token: string): TokenPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(base64)) as TokenPayload
  } catch {
    return null
  }
}

export function getTokenExpiry(token: string): Date | null {
  const payload = getTokenPayload(token)
  if (!payload?.exp) return null
  return new Date(payload.exp * 1000)
}

export function isTokenExpired(token: string): boolean {
  const expiry = getTokenExpiry(token)
  if (!expiry) return true
  return expiry <= new Date()
}
