// Storage abstraction for both Chrome extension and web environments

interface IStorageInterface {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T): Promise<void>
  remove(key: string): Promise<void>
  clear(): Promise<void>
}

class ChromeStorage implements IStorageInterface {
  async get<T>(key: string): Promise<T | null> {
    return new Promise((resolve) => {
      chrome.storage.sync.get([key], (result) => {
        resolve(result[key] || null)
      })
    })
  }

  async set<T>(key: string, value: T): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ [key]: value }, () => {
        resolve()
      })
    })
  }

  async remove(key: string): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.sync.remove([key], () => {
        resolve()
      })
    })
  }

  async clear(): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.sync.clear(() => {
        resolve()
      })
    })
  }
}

class LocalStorage implements IStorageInterface {
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = localStorage.getItem(key)
      return value ? JSON.parse(value) : null
    } catch {
      return null
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('LocalStorage set error:', error)
    }
  }

  async remove(key: string): Promise<void> {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('LocalStorage remove error:', error)
    }
  }

  async clear(): Promise<void> {
    try {
      localStorage.clear()
    } catch (error) {
      console.error('LocalStorage clear error:', error)
    }
  }
}

// Detect environment and use appropriate storage
const isChromeExtension = typeof chrome !== 'undefined' && chrome.storage

export const storage: IStorageInterface = isChromeExtension ? new ChromeStorage() : new LocalStorage()

export default storage
