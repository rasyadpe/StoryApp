const DB_NAME = 'story-app-db';
const STORES = {
  FAVORITES: 'favorites',
  STORIES: 'stories',
  USER_DATA: 'user-data'
};
const DB_VERSION = 1;

let db = null;
let dbInitPromise = null;

const checkIndexedDBSupport = () => {
  const isSupportedAndAccessible = () => {
    try {
      // Early return for browsers that don't support IndexedDB
      if (!window.indexedDB) {
        console.warn('IndexedDB is not supported by this browser');
        return false;
      }

      // Additional check for private browsing mode in Safari
      if (window.webkitStorageInfo || window.webkitIndexedDB) {
        const storage = window.localStorage;
        storage.setItem('test', '1');
        storage.removeItem('test');
      }

      return true;
    } catch (e) {
      console.warn('IndexedDB might be blocked or unavailable:', e);
      return false;
    }
  };

  return isSupportedAndAccessible();
};

export const initDB = () => {
  // Return existing promise if initialization is in progress
  if (dbInitPromise) return dbInitPromise;

  // Check IndexedDB support first
  if (!checkIndexedDBSupport()) {
    dbInitPromise = Promise.reject(new Error('IndexedDB is not supported or blocked'));
    return dbInitPromise;
  }
  
  dbInitPromise = new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = (event) => {
        console.error('Database error:', event.target.error);
        reject(new Error('Failed to open database: ' + event.target.error));
      };

      request.onblocked = (event) => {
        console.warn('Database blocked:', event);
        reject(new Error('Database blocked. Please close other tabs with this site open'));
      };

      request.onupgradeneeded = (event) => {
        console.log('Database upgrade needed');
        const database = event.target.result;

        // Create favorites store if it doesn't exist
        if (!database.objectStoreNames.contains(STORES.FAVORITES)) {
          database.createObjectStore(STORES.FAVORITES, { 
            keyPath: 'id',
            autoIncrement: false
          });
        }

        // Create stories store if it doesn't exist
        if (!database.objectStoreNames.contains(STORES.STORIES)) {
          const storyStore = database.createObjectStore(STORES.STORIES, { 
            keyPath: 'id',
            autoIncrement: false
          });
          storyStore.createIndex('timestamp', 'createdAt', { unique: false });
        }

        // Create user data store if it doesn't exist
        if (!database.objectStoreNames.contains(STORES.USER_DATA)) {
          database.createObjectStore(STORES.USER_DATA, { 
            keyPath: 'key',
            autoIncrement: false
          });
        }
      };

      request.onsuccess = (event) => {
        db = event.target.result;

        // Handle connection errors
        db.onerror = (event) => {
          console.error('Database error:', event.target.error);
        };

        // Handle when db is blocked by other tabs
        db.onversionchange = (event) => {
          db.close();
          console.log('Database is outdated, please reload the page.');
        };

        resolve(db);
      };
    } catch (error) {
      console.error('Error during database initialization:', error);
      reject(error);
    }
  });

  return dbInitPromise;
};

export const openDB = async () => {
  try {
    if (!db) {
      db = await initDB();
    } else {
      // Check if the connection is still alive
      try {
        // Try a simple operation
        const transaction = db.transaction([STORES.FAVORITES], 'readonly');
        transaction.abort(); // Clean up the test transaction
      } catch (e) {
        console.log('Database connection lost, reconnecting...');
        db = await initDB();
      }
    }
    return db;
  } catch (error) {
    console.error('Failed to open database:', error);
    throw error;
  }
};

// Add a story to favorites with retry mechanism
export const addToFavorites = async (story, retryCount = 3) => {
  for (let attempt = 1; attempt <= retryCount; attempt++) {
    try {
      const database = await openDB();
      return await new Promise((resolve, reject) => {
        const transaction = database.transaction([STORES.FAVORITES], 'readwrite');
        
        transaction.oncomplete = () => resolve(true);
        transaction.onerror = () => reject(transaction.error);
        
        const store = transaction.objectStore(STORES.FAVORITES);
        const storyToSave = {
          ...story,
          favoritedAt: new Date().toISOString()
        };
        
        store.put(storyToSave);
      });
    } catch (error) {
      console.error(`Error adding to favorites (attempt ${attempt}/${retryCount}):`, error);
      if (attempt === retryCount) return false;
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
    }
  }
  return false;
};

// Remove a story from favorites with retry mechanism
export const removeFromFavorites = async (storyId, retryCount = 3) => {
  for (let attempt = 1; attempt <= retryCount; attempt++) {
    try {
      const database = await openDB();
      return await new Promise((resolve, reject) => {
        const transaction = database.transaction([STORES.FAVORITES], 'readwrite');
        
        transaction.oncomplete = () => resolve(true);
        transaction.onerror = () => reject(transaction.error);
        
        const store = transaction.objectStore(STORES.FAVORITES);
        store.delete(storyId);
      });
    } catch (error) {
      console.error(`Error removing from favorites (attempt ${attempt}/${retryCount}):`, error);
      if (attempt === retryCount) return false;
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
    }
  }
  return false;
};

// Get all favorite stories with retry mechanism
export const getFavoriteStories = async (retryCount = 3) => {
  for (let attempt = 1; attempt <= retryCount; attempt++) {
    try {
      const database = await openDB();
      return await new Promise((resolve, reject) => {
        const transaction = database.transaction([STORES.FAVORITES], 'readonly');
        const store = transaction.objectStore(STORES.FAVORITES);
        
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error(`Error getting favorite stories (attempt ${attempt}/${retryCount}):`, error);
      if (attempt === retryCount) return [];
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  return [];
};

// Check if a story is favorited with retry mechanism
export const isStoryFavorited = async (storyId, retryCount = 3) => {
  if (!storyId) return false;
  
  for (let attempt = 1; attempt <= retryCount; attempt++) {
    try {
      const database = await openDB();
      
      if (!database.objectStoreNames.contains(STORES.FAVORITES)) {
        console.warn('Favorites store not found, initializing database...');
        await initDB();
        return false;
      }
      
      return await new Promise((resolve, reject) => {
        const transaction = database.transaction([STORES.FAVORITES], 'readonly');
        const store = transaction.objectStore(STORES.FAVORITES);
        
        const request = store.get(storyId);
        request.onsuccess = () => resolve(!!request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error(`Error checking favorite status (attempt ${attempt}/${retryCount}):`, error);
      if (attempt === retryCount) return false;
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  return false;
};

// Get favorite count with retry mechanism
export const getFavoriteCount = async (retryCount = 3) => {
  for (let attempt = 1; attempt <= retryCount; attempt++) {
    try {
      const database = await openDB();
      return await new Promise((resolve, reject) => {
        const transaction = database.transaction([STORES.FAVORITES], 'readonly');
        const store = transaction.objectStore(STORES.FAVORITES);
        
        const request = store.count();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error(`Error getting favorite count (attempt ${attempt}/${retryCount}):`, error);
      if (attempt === retryCount) return 0;
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  return 0;
};

// Clear all favorites with retry mechanism
export const clearFavorites = async (retryCount = 3) => {
  for (let attempt = 1; attempt <= retryCount; attempt++) {
    try {
      const database = await openDB();
      return await new Promise((resolve, reject) => {
        const transaction = database.transaction([STORES.FAVORITES], 'readwrite');
        const store = transaction.objectStore(STORES.FAVORITES);
        
        const request = store.clear();
        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error(`Error clearing favorites (attempt ${attempt}/${retryCount}):`, error);
      if (attempt === retryCount) return false;
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  return false;
};