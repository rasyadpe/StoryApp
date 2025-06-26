import Header from './components/Header';
import Footer from './components/Footer';
import App from './pages/app';
import "./styles/main.css"; // Import main CSS styles
import { registerSW } from 'virtual:pwa-register';

// Register service worker
const updateSW = registerSW({
  onNeedRefresh() {
    // Show a prompt to user about new content being available
    if (confirm('New content available. Reload?')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('App ready to work offline');
  },
});

// Global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Main function to start the application
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Ensure the app container exists
    let appContainer = document.getElementById('app');
    if (!appContainer) {
      console.error('Container with id "app" not found');
      
      // Try to create container if it doesn't exist
      const mainContent = document.getElementById('main-content');
      if (mainContent) {
        appContainer = document.createElement('div');
        appContainer.id = 'app';
        mainContent.appendChild(appContainer);
      } else {
        // Fallback: create both main and app containers
        const mainContainer = document.createElement('main');
        mainContainer.id = 'main-content';
        
        appContainer = document.createElement('div');
        appContainer.id = 'app';
        
        mainContainer.appendChild(appContainer);
        document.body.appendChild(mainContainer);
      }
    }

    // Ensure footer container exists
    let footerContainer = document.getElementById('footer');
    if (!footerContainer) {
      footerContainer = document.createElement('footer');
      footerContainer.id = 'footer';
      footerContainer.setAttribute('role', 'contentinfo');
      footerContainer.style.width = '100%';
      document.body.appendChild(footerContainer);
    }

    // Initialize Header and Footer after DOM is ready
    Header.initialize();
    Footer.initialize();

    // Initialize application
    const app = new App();
    
    // Store app instance globally for debugging
    window.app = app;
    
  } catch (error) {
    console.error('Failed to initialize application:', error);
    
    // Fallback error display
    document.body.innerHTML = `
      <div style="padding: 20px; text-align: center; color: red; font-family: Arial, sans-serif;">
        <h2>Aplikasi Gagal Dimuat</h2>
        <p>Terjadi kesalahan saat menginisialisasi aplikasi.</p>
        <details style="margin: 20px 0; text-align: left; max-width: 600px; margin-left: auto; margin-right: auto;">
          <summary style="cursor: pointer; font-weight: bold;">Detail Error</summary>
          <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; overflow: auto; white-space: pre-wrap;">${error.message || error}</pre>
        </details>
        <button onclick="window.location.reload()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Muat Ulang</button>
      </div>
    `;
  }

  // Hamburger menu logic
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const menuItems = document.getElementById('menu-items');

  if (hamburgerBtn && menuItems) {
    hamburgerBtn.addEventListener('click', function () {
      const expanded = hamburgerBtn.getAttribute('aria-expanded') === 'true';
      hamburgerBtn.setAttribute('aria-expanded', !expanded);
      hamburgerBtn.classList.toggle('active');
      menuItems.classList.toggle('active');
    });
    // Optional: close menu when clicking outside (mobile UX)
    document.addEventListener('click', function (e) {
      if (!hamburgerBtn.contains(e.target) && !menuItems.contains(e.target)) {
        hamburgerBtn.classList.remove('active');
        menuItems.classList.remove('active');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }
});