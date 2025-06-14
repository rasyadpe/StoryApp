const DB_NAME = 'story-app-db';
const DB_VERSION = 1;
const OBJECT_STORE_NAME = 'stories';

let db = null;

async function openDatabase() {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const database = event.target.result;
      if (!database.objectStoreNames.contains(OBJECT_STORE_NAME)) {
        database.createObjectStore(OBJECT_STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      resolve(db);
    };

    request.onerror = (event) => {
      console.error('IndexedDB error:', event.target.errorCode);
      reject(event.target.error);
    };
  });
}

async function addData(data) {
  const database = await openDatabase();
  const transaction = database.transaction([OBJECT_STORE_NAME], 'readwrite');
  const store = transaction.objectStore(OBJECT_STORE_NAME);
  return new Promise((resolve, reject) => {
    const request = store.put(data);
    request.onsuccess = () => {
      resolve();
    };
    request.onerror = (event) => {
      console.error('Error adding data to IndexedDB', event.target.error);
      reject(event.target.error);
    };
  });
}

async function getAllData() {
  const database = await openDatabase();
  const transaction = database.transaction([OBJECT_STORE_NAME], 'readonly');
  const store = transaction.objectStore(OBJECT_STORE_NAME);
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = (event) => {
      console.error('Error getting all data from IndexedDB', event.target.error);
      reject(event.target.error);
    };
  });
}

async function getDataById(id) {
  const database = await openDatabase();
  const transaction = database.transaction([OBJECT_STORE_NAME], 'readonly');
  const store = transaction.objectStore(OBJECT_STORE_NAME);
  return new Promise((resolve, reject) => {
    const request = store.get(id);
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = (event) => {
      console.error('Error getting data by ID from IndexedDB', event.target.error);
      reject(event.target.error);
    };
  });
}

async function deleteData(id) {
  const database = await openDatabase();
  const transaction = database.transaction([OBJECT_STORE_NAME], 'readwrite');
  const store = transaction.objectStore(OBJECT_STORE_NAME);
  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onsuccess = () => {
      resolve();
    };
    request.onerror = (event) => {
      console.error('Error deleting data from IndexedDB', event.target.error);
      reject(event.target.error);
    };
  });
}

export { openDatabase, addData, getAllData, getDataById, deleteData }; 