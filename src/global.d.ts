interface Window {
  operateHistory: import('./store/screenshot-store').HistoryEntry[]
}

interface DisplayMediaStreamOptions {
  preferCurrentTab?: boolean
}
