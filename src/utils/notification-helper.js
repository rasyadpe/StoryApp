const VAPID_PUBLIC_KEY = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';

function urlBase64ToUint8Array(base64String) {
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