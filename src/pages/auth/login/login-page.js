import AuthPresenter from '../../../presenters/authPresenter';
import { showLoading, closeLoading, showError } from '../../../utils/swalHelper';
import Header from '../../../components/Header';

export default function LoginPage() {
  const authPresenter = new AuthPresenter();
  
  document.querySelector('#main-content').innerHTML = `
    <form id="login-form" class="form">
      <h2 class="text-center">Login</h2>
      <div class="form-group">
        <label for="email">Email</label>
        <input 
          type="email" 
          id="email" 
          name="email" 
          class="form-control"
          required 
          aria-required="true"
          autocomplete="email"
        >
      </div>
      
      <div class="form-group">
        <label for="password">Password</label>
        <input 
          type="password" 
          id="password" 
          name="password" 
          class="form-control"
          required
          aria-required="true"
          autocomplete="current-password"
        >
      </div>
      
      <button type="submit" class="btn btn-primary">Login</button>
      
      <p class="text-center">
        Don't have an account? <a href="#/register">Sign up</a>
      </p>
    </form>
  `;

  const form = document.getElementById('login-form');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const email = form.email.value;
    const password = form.password.value;
    
    try {
      showLoading('Logging in...');
      await authPresenter.login(email, password);
      closeLoading();
      Header.updateMenu();
      window.location.hash = '#/stories';
    } catch (error) {
      closeLoading();
      showError(error.message || 'Failed to login');
    }
  });
};
