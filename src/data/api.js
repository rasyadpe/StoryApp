import auth from '../utils/auth';

const BASE_URL = 'https://story-api.dicoding.dev/v1';

class Api {
  constructor() {
    this._baseUrl = BASE_URL;
  }

  async _fetchWithAuth(url, options = {}) {
    const token = auth.getToken();
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async login(email, password) {
    const response = await fetch(`${this._baseUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  }

  async register(name, email, password) {
    const response = await fetch(`${this._baseUrl}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });
    return response.json();
  }

  async getAllStories() {
    const response = await this._fetchWithAuth(`${this._baseUrl}/stories`);
    return response.json();
  }

  async getStoryDetail(id) {
    const response = await this._fetchWithAuth(`${this._baseUrl}/stories/${id}`);
    return response.json();
  }

  async addStory(formData) {
    const response = await this._fetchWithAuth(`${this._baseUrl}/stories`, {
      method: 'POST',
      body: formData,
    });
    return response.json();
  }

  async addGuestStory(formData) {
    const response = await fetch(`${this._baseUrl}/stories/guest`, {
      method: 'POST',
      body: formData,
    });
    return response.json();
  }

  async subscribeToNotifications(subscription) {
    const response = await this._fetchWithAuth(`${this._baseUrl}/notifications/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh')))),
          auth: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('auth')))),
        },
      }),
    });
    return response.json();
  }

  async unsubscribeFromNotifications(endpoint) {
    const response = await this._fetchWithAuth(`${this._baseUrl}/notifications/subscribe`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ endpoint }),
    });
    return response.json();
  }
}

export default new Api(); 