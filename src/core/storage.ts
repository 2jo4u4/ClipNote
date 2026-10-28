/**
 * Storage Abstraction Layer for Notebook Extension.
 * Provides consistent StorageAdapter interface for both Chrome Extension runtime
 * and in-memory test/mock environments.
 */

export interface StorageAdapter {
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}

/**
 * In-memory storage adapter for Vitest unit tests and non-browser environments.
 * Uses structured clone to emulate storage serialization and prevent direct reference mutation.
 */
export class MemoryStorageAdapter implements StorageAdapter {
  private store: Map<string, unknown>;

  constructor(initialData: Record<string, unknown> = {}) {
    this.store = new Map<string, unknown>();
    for (const [key, value] of Object.entries(initialData)) {
      this.store.set(key, this.clone(value));
    }
  }

  private clone<T>(value: T): T {
    if (value === undefined) return undefined as unknown as T;
    try {
      if (typeof structuredClone === 'function') {
        return structuredClone(value);
      }
    } catch {
      // Fallback if structuredClone fails on specific types
    }
    return JSON.parse(JSON.stringify(value));
  }

  async get<T>(key: string): Promise<T | undefined> {
    if (!this.store.has(key)) {
      return undefined;
    }
    const val = this.store.get(key);
    return this.clone(val) as T;
  }

  async set<T>(key: string, value: T): Promise<void> {
    this.store.set(key, this.clone(value));
  }

  async remove(key: string): Promise<void> {
    this.store.delete(key);
  }

  async clear(): Promise<void> {
    this.store.clear();
  }
}

/**
 * Storage adapter wrapping chrome.storage.local.
 * Includes a graceful memory fallback if executed in an environment where chrome.storage is unavailable.
 */
export class ChromeStorageAdapter implements StorageAdapter {
  private fallbackMemory: MemoryStorageAdapter | null = null;
  private customChromeStorage?: typeof chrome.storage.local;

  constructor(customChromeStorage?: typeof chrome.storage.local) {
    this.customChromeStorage = customChromeStorage;
  }

  private getStorage(): typeof chrome.storage.local | null {
    if (this.customChromeStorage) {
      return this.customChromeStorage;
    }
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      return chrome.storage.local;
    }
    return null;
  }

  private getFallback(): MemoryStorageAdapter {
    if (!this.fallbackMemory) {
      this.fallbackMemory = new MemoryStorageAdapter();
    }
    return this.fallbackMemory;
  }

  async get<T>(key: string): Promise<T | undefined> {
    const storage = this.getStorage();
    if (!storage) {
      return this.getFallback().get<T>(key);
    }
    return new Promise((resolve, reject) => {
      try {
        storage.get([key], (items) => {
          if (typeof chrome !== 'undefined' && chrome.runtime?.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(items[key] as T | undefined);
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  async set<T>(key: string, value: T): Promise<void> {
    const storage = this.getStorage();
    if (!storage) {
      return this.getFallback().set<T>(key, value);
    }
    return new Promise((resolve, reject) => {
      try {
        storage.set({ [key]: value }, () => {
          if (typeof chrome !== 'undefined' && chrome.runtime?.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve();
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  async remove(key: string): Promise<void> {
    const storage = this.getStorage();
    if (!storage) {
      return this.getFallback().remove(key);
    }
    return new Promise((resolve, reject) => {
      try {
        storage.remove(key, () => {
          if (typeof chrome !== 'undefined' && chrome.runtime?.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve();
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  async clear(): Promise<void> {
    const storage = this.getStorage();
    if (!storage) {
      return this.getFallback().clear();
    }
    return new Promise((resolve, reject) => {
      try {
        storage.clear(() => {
          if (typeof chrome !== 'undefined' && chrome.runtime?.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve();
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  }
}
