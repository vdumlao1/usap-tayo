/*
  Family voice recordings, stored in the browser's IndexedDB.

  Why IndexedDB and not localStorage? localStorage only holds text and is
  limited to ~5 MB. IndexedDB can store binary audio (Blobs) and much more
  of it. Like localStorage, it stays on this device/browser only.

  Each recording is stored under a key:
    phrase:<phraseId>                for a phrase
    line:<conversationId>:<index>    for a conversation line
*/

const DB_NAME = 'usapTayo';
const STORE = 'recordings';
export const MAX_RECORDING_SECONDS = 15;

export const phraseKey = (phraseId) => `phrase:${phraseId}`;
export const lineKey = (conversationId, index) => `line:${conversationId}:${index}`;

export function isRecordingSupported() {
  return (
    typeof window !== 'undefined' &&
    'indexedDB' in window &&
    'MediaRecorder' in window &&
    !!navigator.mediaDevices?.getUserMedia
  );
}

let dbPromise = null;

function openDb() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    dbPromise.catch(() => {
      dbPromise = null; // allow a retry later
    });
  }
  return dbPromise;
}

/** Run one IndexedDB request inside a transaction and resolve with its result. */
async function run(mode, makeRequest) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const req = makeRequest(tx.objectStore(STORE));
    tx.oncomplete = () => resolve(req.result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export const saveRecording = (key, blob) => run('readwrite', (s) => s.put(blob, key));
export const getRecording = (key) => run('readonly', (s) => s.get(key));
export const deleteRecording = (key) => run('readwrite', (s) => s.delete(key));
export const clearRecordings = () => run('readwrite', (s) => s.clear());
export const listRecordingKeys = () => run('readonly', (s) => s.getAllKeys());

/** Friendly message for microphone errors. */
export function micErrorMessage(error) {
  switch (error?.name) {
    case 'NotAllowedError':
    case 'SecurityError':
      return 'Microphone access was blocked. Allow the microphone for this site in your browser settings, then try again.';
    case 'NotFoundError':
      return 'No microphone was found on this device.';
    case 'NotReadableError':
      return 'The microphone is being used by another app.';
    case 'QuotaExceededError':
      return 'Your browser is out of storage space for recordings.';
    default:
      return 'Recording didn’t work. Please try again.';
  }
}
