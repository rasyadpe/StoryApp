import auth from '../utils/auth';
import api from '../data/api';
import { subscribePushNotification, unsubscribePushNotification } from '../utils/notification-helper';
import { showSuccess, showError } from '../utils/swalHelper';

class Header {
  static initialize() {
    // Update header display when page loads or URL changes
    this.updateMenu();

    // Add event listener to monitor hash changes in URL
    window.addEventListener("hashchange", () => {
      this.updateMenu();
    });
  }

  static async updateMenu() {
    try {
      const userIsLoggedIn = auth.isUserLoggedIn();
      
      // Get references to static navigation items
      const navAddStory = document.getElementById('nav-add-story');
      const navAddStoryLink = navAddStory ? navAddStory.querySelector('a') : null;
      const navLogin = document.getElementById('nav-login');
      const navRegister = document.getElementById('nav-register');
      const navSubscribe = document.getElementById('nav-subscribe');
      const navUnsubscribe = document.getElementById('nav-unsubscribe');
      const navLogout = document.getElementById('nav-logout');

      // Helper to set display style
      const setDisplay = (element, show) => {
        if (element) {
          element.style.display = show ? 'list-item' : 'none';
        }
      };

      // Manage visibility of auth buttons
      if (userIsLoggedIn) {
        setDisplay(navAddStory, true);
        if (navAddStoryLink) {
          navAddStoryLink.href = '#/stories/add';
        }
        setDisplay(navLogout, true);
        setDisplay(navLogin, false);
        setDisplay(navRegister, false);
        
        // Show notification buttons only when logged in
        if ('serviceWorker' in navigator && 'PushManager' in window) {
          try {
            const registration = await navigator.serviceWorker.ready;
            
            const subscription = await registration.pushManager.getSubscription();
            
            if (subscription) {
              setDisplay(navSubscribe, false);
              setDisplay(navUnsubscribe, true);
            } else {
              setDisplay(navSubscribe, true);
              setDisplay(navUnsubscribe, false);
            }
          } catch (error) {
            console.error('Service Worker or Push notification error:', error);
            setDisplay(navSubscribe, true);
            setDisplay(navUnsubscribe, false);
          }
        }
      } else {
        setDisplay(navAddStory, true);
        if (navAddStoryLink) {
          navAddStoryLink.href = '#/stories/guest';
        }
        setDisplay(navLogin, true);
        setDisplay(navRegister, true);
        setDisplay(navLogout, false);
        setDisplay(navSubscribe, false);
        setDisplay(navUnsubscribe, false);
      }
      
      // Add logout functionality if user is logged in
      if (userIsLoggedIn) {
        const logoutLink = document.getElementById("logoutLink");
        if (logoutLink) {
          logoutLink.onclick = async (event) => {
            event.preventDefault();
            event.stopPropagation();
            try {
              await auth.clearUserToken();
              window.location.hash = '#/';
              this.updateMenu();
            } catch (error) {
              console.error('Logout error:', error);
              showError('Terjadi kesalahan saat logout');
            }
          };
        }
      }

      // Add event listeners for push notification buttons
      const subscribeButton = document.getElementById('subscribePush');
      const unsubscribeButton = document.getElementById('unsubscribePush');

      if (subscribeButton) {
        subscribeButton.onclick = async (event) => {
          event.preventDefault();
          event.stopPropagation();
          try {
            const subscription = await subscribePushNotification();
            if (subscription) {
              const response = await api.subscribeToNotifications(subscription);
              if (!response.error) {
                showSuccess('Berhasil berlangganan notifikasi!');
                this.updateMenu();
              } else {
                showError('Gagal berlangganan notifikasi: ' + (response.message || 'Unknown error'));
              }
            }
          } catch (error) {
            console.error('Subscribe notification error:', error);
            showError('Terjadi kesalahan saat berlangganan notifikasi');
          }
        };
      }

      if (unsubscribeButton) {
        unsubscribeButton.onclick = async (event) => {
          event.preventDefault();
          event.stopPropagation();
          try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            
            if (subscription) {
              const unsubscribed = await subscription.unsubscribe();
              
              if (unsubscribed) {
                const response = await api.unsubscribeFromNotifications(subscription.endpoint);
                if (!response.error) {
                  showSuccess('Berhasil berhenti berlangganan notifikasi!');
                  this.updateMenu();
                } else {
                  showError('Berhasil berhenti berlangganan dari browser, tapi gagal dari server: ' + (response.message || 'Unknown error'));
                  this.updateMenu();
                }
              }
            } else {
              showError('Gagal berhenti berlangganan notifikasi');
            }
          } catch (error) {
            console.error('Unsubscribe notification error:', error);
            showError('Terjadi kesalahan saat berhenti berlangganan notifikasi');
          }
        };
      }
    } catch (error) {
      console.error("Error in Header.updateMenu:", error);
    }
  }
}

export default Header;