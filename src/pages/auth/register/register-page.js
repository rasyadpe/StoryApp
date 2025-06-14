import AuthPresenter from "../../../presenters/authPresenter";
import { showLoading, closeLoading, showError, showSuccess } from '../../../utils/swalHelper';

export default function RegisterPage () {
  const authPresenter = new AuthPresenter();
  
  document.querySelector('#main-content').innerHTML = `
    <form id="register-form" class="form">
      <h2 class="text-center">Register</h2>
      <div class="form-group">
        <label for="name">Nama</label>
        <input id="name" name="name" type="text" required class="form-control" />
      </div>
      <div class="form-group">
        <label for="email">Email</label>
        <input id="email" name="email" type="email" required class="form-control" />
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input id="password" name="password" type="password" required minlength="8" class="form-control"/>
      </div>
      <button type="submit" class="btn btn-primary">Register</button>
      <p class="text-center">Sudah punya akun? <a href="#/login">Login di sini</a></p>
    </form>
  `;

  const form = document.getElementById('register-form');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = form.name.value;
    const email = form.email.value;
    const password = form.password.value;

    try {
      showLoading('Creating your account...');
      await authPresenter.register(name, email, password);
      closeLoading();
      await showSuccess('Registration successful! Please login.');
      window.location.hash = '#/login';
    } catch (err) {
      closeLoading();
      showError(err.message || 'Failed to register');
    }
  });
};
