/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '*.json' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const value: any
  export default value
}

// Chrome API types
interface IChromeManifest {
  version: string
  [key: string]: unknown
}

interface IChromeRuntime {
  getManifest: () => IChromeManifest
}

interface IChromeStorageLocal {
  clear: (callback?: () => void) => void
}

interface IChromeStorage {
  local: IChromeStorageLocal
}

interface IChromeAPI {
  runtime: IChromeRuntime
  storage: IChromeStorage
}

declare global {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface Window {
    chrome?: IChromeAPI
  }
}
