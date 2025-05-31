// Global type definitions for browser APIs

interface Window {
  chrome?: {
    runtime?: {
      id?: string
    }
  }
  process?: {
    type?: string
  }
}
