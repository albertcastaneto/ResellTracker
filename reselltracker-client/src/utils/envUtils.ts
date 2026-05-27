export function validateEnv(): void {
  if (!import.meta.env.VITE_API_URL) {
    console.warn('[ResellTracker] VITE_API_URL is not set. API calls will fail.')
  }
}
