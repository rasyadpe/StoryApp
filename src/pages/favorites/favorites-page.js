import { getFavoriteStories, removeFromFavorites } from '../../utils/indexed-db-helper';
import { showSuccess, showError } from '../../utils/swalHelper';

const FavoritesPage = {
  async render() {
    return `
      <div class="favorites-container">
        <h1 class="page-title">My Favorite Stories</h1>
        <div id="favorites-list" class="stories-grid">
          <div class="loading">Loading favorites...</div>
        </div>
      </div>
    `;
  },

  async afterRender() {
    const favoritesList = document.getElementById('favorites-list');
    try {
      const favorites = await getFavoriteStories();
      
      if (favorites.length === 0) {
        favoritesList.innerHTML = `
          <div class="empty-state">
            <i class="fas fa-heart-broken"></i>
            <p>No favorite stories yet</p>
            <a href="#/" class="btn btn-primary">Explore Stories</a>
          </div>
        `;
        return;
      }

      const storiesHTML = favorites
        .sort((a, b) => new Date(b.favoritedAt) - new Date(a.favoritedAt))
        .map(story => `
          <article class="story-card" data-story-id="${story.id}">
            <div class="story-card__image-container">
              <img 
                src="${story.photoUrl}" 
                alt="Photo from ${story.name}'s story"
                class="story-card__image"
                loading="lazy"
              />
            </div>
            <div class="story-card__content">
              <h2 class="story-card__title">${story.name}</h2>
              <p class="story-card__description">${story.description}</p>
              <div class="story-card__meta">
                <span class="story-card__date">
                  ${new Date(story.createdAt).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
                <button 
                  class="btn btn-danger btn-sm remove-favorite"
                  data-story-id="${story.id}"
                  aria-label="Remove from favorites"
                >
                  <i class="fas fa-heart-broken"></i> Remove
                </button>
              </div>
            </div>
          </article>
        `)
        .join('');

      favoritesList.innerHTML = storiesHTML;

      // Add event listeners for remove buttons
      favoritesList.addEventListener('click', async (e) => {
        const removeButton = e.target.closest('.remove-favorite');
        if (!removeButton) return;

        const storyId = removeButton.dataset.storyId;
        try {
          const confirmed = await showConfirmation(
            'Remove from Favorites?',
            'Are you sure you want to remove this story from your favorites?'
          );

          if (confirmed) {
            await removeFromFavorites(storyId);
            const storyCard = document.querySelector(`[data-story-id="${storyId}"]`);
            storyCard.remove();

            // Check if there are any favorites left
            if (favoritesList.children.length === 0) {
              favoritesList.innerHTML = `
                <div class="empty-state">
                  <i class="fas fa-heart-broken"></i>
                  <p>No favorite stories yet</p>
                  <a href="#/" class="btn btn-primary">Explore Stories</a>
                </div>
              `;
            }

            showSuccess('Story removed from favorites');
          }
        } catch (error) {
          showError('Failed to remove story from favorites');
          console.error('Error removing favorite:', error);
        }
      });

    } catch (error) {
      favoritesList.innerHTML = `
        <div class="error-state">
          <i class="fas fa-exclamation-circle"></i>
          <p>Failed to load favorite stories</p>
          <button onclick="window.location.reload()" class="btn btn-primary">
            Try Again
          </button>
        </div>
      `;
      console.error('Error loading favorites:', error);
    }
  }
};

export default FavoritesPage;
