export const VAPID_PUBLIC_KEY = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';

export function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function subscribePushNotification() {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker not supported');
    return;
  }
  if (!('PushManager' in window)) {
    console.warn('Push API not supported');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    console.log('Service Worker ready, attempting to subscribe...');
    
    // Convert VAPID key to Uint8Array
    const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
    console.log('Application server key converted:', applicationServerKey);

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey
    });
    
    console.log('Push subscription successful:', subscription);
    return subscription;
  } catch (error) {
    console.error('Failed to subscribe to push notification:', error);
    return null;
  }
}

async function unsubscribePushNotification() {
  if (!('PushManager' in window)) {
    console.warn('Push API not supported');
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
      console.log('Push unsubscribed');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to unsubscribe from push notification:', error);
    return false;
  }
}

export { subscribePushNotification, unsubscribePushNotification };

export const requestNotificationPermission = async () => {
  try {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

export const showNotification = async (title, options = {}) => {
  try {
    if (Notification.permission !== 'granted') {
      console.log('Notification permission not granted');
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(title, {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      vibrate: [200, 100, 200],
      timestamp: Date.now(),
      requireInteraction: true,
      ...options,
    });
  } catch (error) {
    console.error('Error showing notification:', error);
  }
};

// Notification for new story
export const notifyNewStory = async (story) => {
  await showNotification('New Story Posted!', {
    body: `${story.name} just shared a new story: ${story.description.substring(0, 50)}...`,
    icon: story.photoUrl || '/icons/icon-192x192.png',
    data: { url: `/stories/${story.id}` },
    actions: [
      {
        action: 'view',
        title: 'View Story'
      },
      {
        action: 'close',
        title: 'Close'
      }
    ]
  });
};

// Notification for likes
export const notifyStoryLiked = async (story) => {
  await showNotification('Story Liked!', {
    body: `Someone liked your story: ${story.description.substring(0, 50)}...`,
    icon: story.photoUrl || '/icons/icon-192x192.png',
    data: { url: `/stories/${story.id}` }
  });
};

// Notification for offline availability
export const notifyOfflineReady = async () => {
  await showNotification('Offline Ready', {
    body: 'App is ready for offline use. You can now view stories without internet!',
    tag: 'offline-ready'
  });
};

// Handle notification clicks
export const handleNotificationClick = (event) => {
  const notification = event.notification;
  const action = event.action;
  const data = notification.data;

  notification.close();

  if (action === 'view' && data?.url) {
    clients.openWindow(data.url);
  }
};