export default function HomePage() {
  document.querySelector('#main-content').innerHTML = `
    <div class="container">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-content">
          <h1 class="hero-title">Share Your Stories with the World</h1>
          <p class="hero-subtitle">Capture moments, share experiences, and connect with storytellers around the globe.</p>
          <div class="hero-buttons">
            <a href="#/stories" class="btn btn-primary">Explore Stories</a>
            <a href="#/stories/add" class="btn btn-secondary">Share Your Story</a>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="features-section">
        <h2 class="section-title">Why Share Your Story?</h2>
        <div class="features-grid">
          <div class="feature-card">
            <i class="fas fa-camera feature-icon"></i>
            <h3>Capture Moments</h3>
            <p>Take photos directly with your camera or upload your best shots to share your perspective.</p>
          </div>
          <div class="feature-card">
            <i class="fas fa-map-marker-alt feature-icon"></i>
            <h3>Mark Your Location</h3>
            <p>Add location details to your stories and help others discover amazing places.</p>
          </div>
          <div class="feature-card">
            <i class="fas fa-users feature-icon"></i>
            <h3>Connect with Others</h3>
            <p>Join a community of storytellers and share your experiences with the world.</p>
          </div>
        </div>
      </section>
  `;
}
