const AUTH_KEY = 'story_auth';

class Auth {
  constructor() {
    this._token = localStorage.getItem(AUTH_KEY) || null;
  }

  setToken(token) {
    this._token = token;
    localStorage.setItem(AUTH_KEY, token);
  }

  getToken() {
    return this._token;
  }

  removeToken() {
    this._token = null;
    localStorage.removeItem(AUTH_KEY);
  }

  clearUserToken() {
    this.removeToken();
    window.location.hash = '#/login';
  }

  isUserLoggedIn() {
    return !!this._token;
  }
}

export default new Auth(); 