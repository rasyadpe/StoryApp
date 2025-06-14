import api from '../data/api';

class StoryPresenter {
  constructor() {
    this._api = api;
  }

  async getAllStories() {
    try {
      const response = await this._api.getAllStories();
      if (response.error) {
        throw new Error(response.message);
      }
      return response.listStory;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch stories');
    }
  }

  async getStoryDetail(id) {
    try {
      const response = await this._api.getStoryDetail(id);
      if (response.error) {
        throw new Error(response.message);
      }
      return response.story;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch story detail');
    }
  }

  async addStory(formData) {
    try {
      const response = await this._api.addStory(formData);
      if (response.error) {
        throw new Error(response.message);
      }

      // Get the story description for the notification
      const storyDescription = formData.get('description');

      // Request and show notification
      if ('Notification' in window && 'serviceWorker' in navigator) {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            navigator.serviceWorker.ready.then(async registration => {
              // Check if there is an active push subscription
              const subscription = await registration.pushManager.getSubscription();

              if (subscription) {
                registration.showNotification('Story berhasil dibuat', {
                  body: `Anda telah membuat story baru dengan deskripsi: ${storyDescription}`,
                  icon: '/public/icons/icon-512x512.png',
                  badge: '/public/icons/icon-192x192.png',
                  vibrate: [100, 50, 100],
                  data: {
                    storyId: response.data?.story?.id,
                  },
                });
              }
            });
          }
        });
      }

      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to add story');
    }
  }

  async addGuestStory(formData) {
    try {
      const response = await this._api.addGuestStory(formData);
      if (response.error) {
        throw new Error(response.message);
      }

      // Get the story description for the notification
      const storyDescription = formData.get('description');

      // Request and show notification (same logic as addStory)
      if ('Notification' in window && 'serviceWorker' in navigator) {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            navigator.serviceWorker.ready.then(async registration => {
              const subscription = await registration.pushManager.getSubscription();

              if (subscription) {
                registration.showNotification('Story berhasil dibuat', {
                  body: `Anda telah membuat story baru dengan deskripsi: ${storyDescription}`,
                  icon: '/public/icons/icon-512x512.png',
                  badge: '/public/icons/icon-192x192.png',
                  vibrate: [100, 50, 100],
                  data: {
                    storyId: response.data?.story?.id, // Assuming guest API also returns id in same structure
                  },
                });
              }
            });
          }
        });
      }

      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to add guest story');
    }
  }
}

export default StoryPresenter; 