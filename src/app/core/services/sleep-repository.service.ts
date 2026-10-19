/**
 * Somnia - IndexedDB Persistence Repository
 * Manages local offline storage for sleep records and reproducible artwork configurations.
 */

import { Injectable } from '@angular/core';
import { SleepRecord } from '../models/sleep-record.model';
import { SavedArtwork } from '../models/artwork.model';

const DB_NAME = 'somnia_db';
const DB_VERSION = 1;
const STORE_SLEEP = 'sleep_records';
const STORE_ARTWORK = 'saved_artworks';

@Injectable({
  providedIn: 'root',
})
export class SleepRepositoryService {
  private dbPromise: Promise<IDBDatabase> | null = null;
  // In-memory fallback for headless or restricted environments
  private memorySleepRecords: Map<string, SleepRecord> = new Map();
  private memoryArtworks: Map<string, SavedArtwork> = new Map();

  constructor() {
    if (this.isIndexedDBAvailable()) {
      this.initDatabase().catch(() => {});
    }
  }

  private isIndexedDBAvailable(): boolean {
    return (
      typeof window !== 'undefined' &&
      typeof window.indexedDB !== 'undefined' &&
      window.indexedDB !== null
    );
  }

  private initDatabase(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    if (!this.isIndexedDBAvailable()) {
      return Promise.reject(new Error('IndexedDB not available in this environment'));
    }

    this.dbPromise = new Promise((resolve, reject) => {
      try {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;

          if (!db.objectStoreNames.contains(STORE_SLEEP)) {
            const sleepStore = db.createObjectStore(STORE_SLEEP, {
              keyPath: 'id',
            });
            sleepStore.createIndex('date', 'date', { unique: false });
            sleepStore.createIndex('createdAt', 'createdAt', { unique: false });
          }

          if (!db.objectStoreNames.contains(STORE_ARTWORK)) {
            const artStore = db.createObjectStore(STORE_ARTWORK, {
              keyPath: 'id',
            });
            artStore.createIndex('createdAt', 'createdAt', { unique: false });
            artStore.createIndex('seed', 'seed', { unique: false });
          }
        };

        request.onsuccess = (event) => {
          resolve((event.target as IDBOpenDBRequest).result);
        };

        request.onerror = (event) => {
          console.warn('IndexedDB open error, falling back to memory store:', event);
          reject((event.target as IDBOpenDBRequest).error);
        };
      } catch (err) {
        console.warn('IndexedDB initialization failed:', err);
        reject(err);
      }
    });

    return this.dbPromise;
  }

  // --- Sleep Records API ---

  public async saveSleepRecord(record: SleepRecord): Promise<void> {
    try {
      const db = await this.initDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_SLEEP, 'readwrite');
        const store = tx.objectStore(STORE_SLEEP);
        const req = store.put(record);

        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      this.memorySleepRecords.set(record.id, { ...record });
    }
  }

  public async getSleepRecord(id: string): Promise<SleepRecord | undefined> {
    try {
      const db = await this.initDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_SLEEP, 'readonly');
        const store = tx.objectStore(STORE_SLEEP);
        const req = store.get(id);

        req.onsuccess = () => resolve(req.result as SleepRecord | undefined);
        req.onerror = () => reject(req.error);
      });
    } catch {
      return this.memorySleepRecords.get(id);
    }
  }

  public async getAllSleepRecords(): Promise<SleepRecord[]> {
    try {
      const db = await this.initDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_SLEEP, 'readonly');
        const store = tx.objectStore(STORE_SLEEP);
        const req = store.getAll();

        req.onsuccess = () => {
          const list = (req.result as SleepRecord[]) || [];
          list.sort((a, b) => b.createdAt - a.createdAt);
          resolve(list);
        };
        req.onerror = () => reject(req.error);
      });
    } catch {
      const list = Array.from(this.memorySleepRecords.values());
      list.sort((a, b) => b.createdAt - a.createdAt);
      return list;
    }
  }

  public async deleteSleepRecord(id: string): Promise<void> {
    try {
      const db = await this.initDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_SLEEP, 'readwrite');
        const store = tx.objectStore(STORE_SLEEP);
        const req = store.delete(id);

        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      this.memorySleepRecords.delete(id);
    }
  }

  // --- Saved Artworks API ---

  public async saveArtwork(artwork: SavedArtwork): Promise<void> {
    try {
      const db = await this.initDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_ARTWORK, 'readwrite');
        const store = tx.objectStore(STORE_ARTWORK);
        const req = store.put(artwork);

        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      this.memoryArtworks.set(artwork.id, { ...artwork });
    }
  }

  public async getArtwork(id: string): Promise<SavedArtwork | undefined> {
    try {
      const db = await this.initDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_ARTWORK, 'readonly');
        const store = tx.objectStore(STORE_ARTWORK);
        const req = store.get(id);

        req.onsuccess = () => resolve(req.result as SavedArtwork | undefined);
        req.onerror = () => reject(req.error);
      });
    } catch {
      return this.memoryArtworks.get(id);
    }
  }

  public async getAllArtworks(): Promise<SavedArtwork[]> {
    try {
      const db = await this.initDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_ARTWORK, 'readonly');
        const store = tx.objectStore(STORE_ARTWORK);
        const req = store.getAll();

        req.onsuccess = () => {
          const list = (req.result as SavedArtwork[]) || [];
          list.sort((a, b) => b.createdAt - a.createdAt);
          resolve(list);
        };
        req.onerror = () => reject(req.error);
      });
    } catch {
      const list = Array.from(this.memoryArtworks.values());
      list.sort((a, b) => b.createdAt - a.createdAt);
      return list;
    }
  }

  public async deleteArtwork(id: string): Promise<void> {
    try {
      const db = await this.initDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_ARTWORK, 'readwrite');
        const store = tx.objectStore(STORE_ARTWORK);
        const req = store.delete(id);

        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      this.memoryArtworks.delete(id);
    }
  }
}
