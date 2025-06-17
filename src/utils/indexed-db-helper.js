const DB_NAME = 'story-app-db';
const STORES = {
  FAVORITES: 'favorites',
  STORIES: 'stories',
  USER_DATA: 'user-data'
};
const DB_VERSION = 1;

let db = null;
let dbInitPromise = null;

const createStores = (database) => {
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

const validateDatabase = (database) => {
  const stores = [STORES.FAVORITES, STORES.STORIES, STORES.USER_DATA];
  const missingStores = stores.filter(store => !database.objectStoreNames.contains(store));
  
  if (missingStores.length > 0) {
    console.warn('Missing stores detected:', missingStores);
    throw new Error('Database schema is incomplete');
  }
  
  return true;
};

export const initDB = () => {
  if (dbInitPromise) {
    return dbInitPromise;
  }

  dbInitPromise = new Promise((resolve, reject) => {
    try {
      const request = indexedDB.deleteDatabase(DB_NAME);
      
      request.onerror = () => {
        console.error('Could not delete database');
      };

      request.onsuccess = () => {
        console.log('Database deleted successfully');
        
        // Now create a new database
        const openRequest = indexedDB.open(DB_NAME, DB_VERSION);

        openRequest.onerror = (event) => {
          console.error('Database error:', event.target.error);
          reject(event.target.error);
        };

        openRequest.onupgradeneeded = (event) => {
          console.log('Database upgrade needed');
          const database = event.target.result;
          createStores(database);
        };

        openRequest.onsuccess = (event) => {
          db = event.target.result;
          
          try {
            validateDatabase(db);
            console.log('Database initialized successfully');
            resolve(db);
          } catch (error) {
            console.error('Database validation failed:', error);
            
            // Close the invalid database connection
            db.close();
            
            // Try to create a new database with a higher version
            const retryRequest = indexedDB.open(DB_NAME, DB_VERSION + 1);
            
            retryRequest.onupgradeneeded = (event) => {
              const database = event.target.result;
              createStores(database);
            };
            
            retryRequest.onsuccess = (event) => {
              db = event.target.result;
              console.log('Database recreated successfully');
              resolve(db);
            };
            
            retryRequest.onerror = (event) => {
              console.error('Failed to recreate database:', event.target.error);
              reject(event.target.error);
            };
          }
        };
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
    }
    
    // Verify database is valid
    try {
      validateDatabase(db);
    } catch (error) {
      console.warn('Invalid database detected, reinitializing...');
      db = await initDB();
    }
    
    return db;
  } catch (error) {
    console.error('Failed to open database:', error);
    throw error;
  }
};

// Add a story to favorites
export const addToFavorites = async (story) => {
  try {
    const database = await openDB();
    
    // Double check that the store exists
    if (!database.objectStoreNames.contains(STORES.FAVORITES)) {
      console.warn('Favorites store not found, reinitializing database...');
      database = await initDB();
      
      if (!database.objectStoreNames.contains(STORES.FAVORITES)) {
        throw new Error('Failed to create favorites store');
      }
    }
    
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
    console.error('Error adding to favorites:', error);
    return false;
  }
};

// Check if a story is favorited
export const isStoryFavorited = async (storyId) => {
  if (!storyId) return false;
  
  try {
    const database = await openDB();
    
    // Verify the store exists
    if (!database.objectStoreNames.contains(STORES.FAVORITES)) {
      console.warn('Favorites store not found, reinitializing database...');
      database = await initDB();
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
    console.error('Error checking favorite status:', error);
    return false;
  }
};

// Remove a story from favorites
export const removeFromFavorites = async (storyId) => {
  try {
    const database = await openDB();
    
    // Verify the store exists
    if (!database.objectStoreNames.contains(STORES.FAVORITES)) {
      console.warn('Favorites store not found, reinitializing database...');
      database = await initDB();
      return false;
    }
    
    return await new Promise((resolve, reject) => {
      const transaction = database.transaction([STORES.FAVORITES], 'readwrite');
      
      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => reject(transaction.error);
      
      const store = transaction.objectStore(STORES.FAVORITES);
      store.delete(storyId);
    });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return false;
  }
};

// Get all favorite stories
export const getFavoriteStories = async () => {
  try {
    const database = await openDB();
    
    // Verify the store exists
    if (!database.objectStoreNames.contains(STORES.FAVORITES)) {
      console.warn('Favorites store not found, reinitializing database...');
      database = await initDB();
      return [];
    }
    
    return await new Promise((resolve, reject) => {
      const transaction = database.transaction([STORES.FAVORITES], 'readonly');
      const store = transaction.objectStore(STORES.FAVORITES);
      
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error getting favorite stories:', error);
    return [];
  }
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