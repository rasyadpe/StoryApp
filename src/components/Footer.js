class Footer {
  static initialize() {
    const footerContainer = document.getElementById("footer");
    if (!footerContainer) return;
    footerContainer.innerHTML = `
      <div class="footer-content">
        <div class="footer-left">
          <span>&copy; ${new Date().getFullYear()} Story App. All rights reserved.</span>
        </div>
        <div class="footer-center">
          <a href="#/" class="footer-link">Home</a>
          <a href="#/stories" class="footer-link">Stories</a>
          <a href="#/stories/add" class="footer-link">Add Story</a>
        </div>
        <div class="footer-right">
          <a href="https://github.com/rasyadpe" target="_blank" rel="noopener" class="footer-icon" aria-label="GitHub"><i class="fab fa-github"></i></a>
          <a href="mailto:rasyadp.e@gmail.com" class="footer-icon" aria-label="Email"><i class="fas fa-envelope"></i></a>
        </div>
      </div>
    `;
  }
}

export default Footer; 