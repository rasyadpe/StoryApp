import { matchRoute, guardRoute } from '../routes/routes';
import { 
  requestNotificationPermission, 
  notifyOfflineReady, 
  VAPID_PUBLIC_KEY,
  urlBase64ToUint8Array 
} from '../utils/notification-helper';
import { initDB } from '../utils/indexed-db-helper';

class App {
  constructor() {
    // Initialize IndexedDB
    initDB().catch(error => {
      console.error('Failed to initialize IndexedDB:', error);
    });

    // Jika hash adalah #main-content saat load, redirect ke #/ dan fokus ke main-content
    if (window.location.hash === '#main-content') {
      window.location.hash = '#/';
      setTimeout(() => {
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
          mainContent.setAttribute('tabindex', '-1');
          mainContent.focus();
        }
      }, 0);
    }
    this._initializeApp();
  }

  async _initializeApp() {
    // Initialize notifications
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        
        // Request notification permission
        const notificationPermission = await requestNotificationPermission();
        if (notificationPermission) {
          console.log('Notification permission granted');
          
          // Subscribe to push notifications
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
          });
          
          // Here you would typically send the subscription to your backend
          console.log('Push notification subscription:', subscription);
        }

        // Listen for offline capability
        window.addEventListener('online', this._handleOnlineStatus.bind(this));
        window.addEventListener('offline', this._handleOnlineStatus.bind(this));
        
        // Notify user when content is cached and ready for offline use
        registration.addEventListener('activated', (event) => {
          if (!event.isUpdate) {
            notifyOfflineReady();
          }
        });
      } catch (error) {
        console.error('Error initializing notifications:', error);
      }
    }

    // Initialize the router
    window.addEventListener('hashchange', () => {
      // Jika hash adalah #main-content, jangan render page, cukup fokus ke main-content
      if (window.location.hash === '#main-content') {
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
          mainContent.setAttribute('tabindex', '-1');
          mainContent.focus();
        }
        return;
      }
      this._renderPage();
    });

    // Render the initial page
    this._renderPage();
  }

  _handleOnlineStatus() {
    const isOnline = navigator.onLine;
    const statusMessage = isOnline ? 'You are back online!' : 'You are offline. Some features may be limited.';
    
    // Show notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(statusMessage, {
        icon: '/icons/icon-192x192.png',
        tag: 'connectivity-status'
      });
    }

    // Update UI if needed
    const statusElement = document.getElementById('connection-status');
    if (statusElement) {
      statusElement.textContent = statusMessage;
      statusElement.className = isOnline ? 'online' : 'offline';
    }
  }

  async _renderPage() {
    const mainContent = document.querySelector('#main-content');
    
    try {
      // Get the route from the hash
      let hash = window.location.hash || '#/';
      // Jika hash adalah #main-content, perlakukan sama seperti #/
      if (hash === '#main-content') hash = '#/';

      // Check if user can access the route
      if (!guardRoute(hash)) {
        return;
      }

      // Get the page component from routes
      const page = matchRoute(hash);
      
      if (!page) {
        if (document.startViewTransition) {
          document.startViewTransition(() => {
            mainContent.innerHTML = '<h2>404 - Page Not Found</h2>';
          });
        } else {
          mainContent.innerHTML = '<h2>404 - Page Not Found</h2>';
        }
        return;
      }

      // View Transition API untuk transisi halaman
      if (document.startViewTransition) {
        document.startViewTransition(() => {
          page();
        });
      } else {
        page();
      }

    } catch (error) {
      console.error('Error rendering page:', error);
      if (document.startViewTransition) {
        document.startViewTransition(() => {
          mainContent.innerHTML = `
            <div class="error-message">
              <h2>Error</h2>
              <p>${error.message}</p>
            </div>
          `;
        });
      } else {
        mainContent.innerHTML = `
          <div class="error-message">
            <h2>Error</h2>
            <p>${error.message}</p>
          </div>
        `;
      }
    }
  }
}

export default App;