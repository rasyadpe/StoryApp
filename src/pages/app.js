import { matchRoute, guardRoute } from '../routes/routes';

class App {
  constructor() {
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

  _initializeApp() {
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