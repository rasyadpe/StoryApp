import auth from '../utils/auth';
import api from '../data/api';

class AuthPresenter {
  constructor() {
    this._api = api;
    this._auth = auth;
  }

  async login(email, password) {
    try {
      const response = await this._api.login(email, password);
      if (response.error) {
        throw new Error(response.message);
      }
      
      this._auth.setToken(response.loginResult.token);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to login');
    }
  }

  async register(name, email, password) {
    try {
      const response = await this._api.register(name, email, password);
      if (response.error) {
        throw new Error(response.message);
      }
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to register');
    }
  }

  logout() {
    this._auth.clearUserToken();
  }

  isLoggedIn() {
    return this._auth.isUserLoggedIn();
  }
}

export default AuthPresenter; 