const DB_NAME = 'story-app-db';
const STORES = {
  FAVORITES: 'favorites',
  STORIES: 'stories',
  USER_DATA: 'user-data'
};
const DB_VERSION = 1;

let db = null;

export const openDB = () => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(request.error);
    };

    request.onupgradeneeded = (event) => {
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
      resolve(db);
    };
  });
};

// Add a story to favorites
export const addToFavorites = async (story) => {
  try {
    const database = await openDB();
    const transaction = database.transaction([STORES.FAVORITES], 'readwrite');
    const store = transaction.objectStore(STORES.FAVORITES);
    
    const storyToSave = {
      ...story,
      favoritedAt: new Date().toISOString()
    };
    
    await new Promise((resolve, reject) => {
      const request = store.put(storyToSave);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
    
    return true;
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return false;
  }
};

// Remove a story from favorites
export const removeFromFavorites = async (storyId) => {
  try {
    const database = await openDB();
    const transaction = database.transaction([STORES.FAVORITES], 'readwrite');
    const store = transaction.objectStore(STORES.FAVORITES);
    
    await new Promise((resolve, reject) => {
      const request = store.delete(storyId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
    
    return true;
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return false;
  }
};

// Get all favorite stories
export const getFavoriteStories = async () => {
  try {
    const database = await openDB();
    const transaction = database.transaction([STORES.FAVORITES], 'readonly');
    const store = transaction.objectStore(STORES.FAVORITES);
    
    return await store.getAll();
  } catch (error) {
    console.error('Error getting favorite stories:', error);
    return [];
  }
};

// Check if a story is favorited
export const isStoryFavorited = async (storyId) => {
  try {
    const database = await openDB();
    const transaction = database.transaction([STORES.FAVORITES], 'readonly');
    const store = transaction.objectStore(STORES.FAVORITES);
    
    const result = await new Promise((resolve, reject) => {
      const request = store.get(storyId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    return !!result;
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return false;
  }
};

// Get favorite count
export const getFavoriteCount = async () => {
  try {
    const database = await openDB();
    const transaction = database.transaction([STORES.FAVORITES], 'readonly');
    const store = transaction.objectStore(STORES.FAVORITES);
    
    return await store.count();
  } catch (error) {
    console.error('Error getting favorite count:', error);
    return 0;
  }
};

// Clear all favorites
export const clearFavorites = async () => {
  try {
    const database = await openDB();
    const transaction = database.transaction([STORES.FAVORITES], 'readwrite');
    const store = transaction.objectStore(STORES.FAVORITES);
    
    await store.clear();
    return true;
  } catch (error) {
    console.error('Error clearing favorites:', error);
    return false;
  }
};