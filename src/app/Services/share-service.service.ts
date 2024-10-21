import { Injectable } from '@angular/core';
import { openDB, IDBPDatabase } from 'idb';
import * as CryptoJS from 'crypto-js';
import { environment } from '../../environments/environment.dev';  // Update path as needed

@Injectable({
  providedIn: 'root',
})
export class ShareServiceService {
  private encryptionKey: string = environment.encryptionKey;
  private dbPromise: Promise<IDBPDatabase>;

  constructor() {
    console.log('[ShareService] Initializing...');
    this.dbPromise = this.openDatabase();
  }

  private async openDatabase(): Promise<IDBPDatabase> {
    console.log('[ShareService] Opening database...');
    return openDB('MyDatabase', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('keyval')) {
          console.log('[ShareService] Creating object store...');
          db.createObjectStore('keyval');
        }
      },
    });
  }

  async setItem(key: string, value: any): Promise<void> {
    try {
      console.log(`[ShareService] Saving item with key: ${key}`);
      const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(value), this.encryptionKey).toString();
      const db = await this.dbPromise;
      await db.put('keyval', encryptedData, key);
      console.log(`[ShareService] Item saved successfully: key=${key}`);
    } catch (error) {
      console.error(`[ShareService] Error saving item: key=${key}`, error);
    }
  }

  async getItem(key: string): Promise<any | null> {
    try {
      console.log(`[ShareService] Fetching item with key: ${key}`);
      const db = await this.dbPromise;
      const encryptedData = await db.get('keyval', key);
      if (encryptedData) {
        const bytes = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
        const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
        console.log(`[ShareService] Item fetched successfully: key=${key}`);
        return JSON.parse(decryptedData);
      } else {
        console.warn(`[ShareService] No item found for key: ${key}`);
      }
    } catch (error) {
      console.error(`[ShareService] Error fetching item: key=${key}`, error);
    }
    return null;
  }

  async clear(): Promise<void> {
    try {
      console.log('[ShareService] Clearing all data...');
      const db = await this.dbPromise;
      await db.clear('keyval');
      sessionStorage.clear();
      localStorage.clear();
      console.log('[ShareService] All data cleared from IndexedDB, sessionStorage, and localStorage.');
    } catch (error) {
      console.error('[ShareService] Error clearing data', error);
    }
  }
}
