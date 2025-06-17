import { addToFavorites, removeFromFavorites, isStoryFavorited, initDB } from '../../utils/indexed-db-helper';
import { showSuccess, showError } from '../../utils/swalHelper';
import StoryPresenter from '../../presenters/storyPresenter';

export default function StoryListPage() {
  const storyPresenter = new StoryPresenter();
  
  // Initialize IndexedDB first and wait for it to complete
  document.querySelector('#main-content').innerHTML = `
    <div class="container">
      <h1>Stories</h1>
      <div class="story-list__items" id="storyList">
        <div class="loading">Initializing...</div>
      </div>
    </div>
  `;

  initializeAndLoadStories();

  async function initializeAndLoadStories() {
    try {
      // Wait for database initialization
      await initDB();
      console.log('Database initialized successfully');
      await fetchStories();
    } catch (error) {
      console.error('Failed to initialize database:', error);
      document.querySelector('#storyList').innerHTML = `
        <div class="error-message">
          <p>Failed to initialize: ${error.message}</p>
          <button onclick="window.location.reload()" class="btn btn-primary">Retry</button>
        </div>
      `;
    }
  }

  async function fetchStories() {
    try {
      const stories = await storyPresenter.getAllStories();
      await displayStories(stories);
    } catch (error) {
      document.querySelector('#storyList').innerHTML = `
        <div class="error-message">
          <p>Failed to load stories: ${error.message}</p>
          <button onclick="window.location.reload()" class="btn btn-primary">Retry</button>
        </div>
      `;
    }
  }

  async function displayStories(stories) {
    const storyList = document.querySelector('#storyList');
    
    if (!stories || stories.length === 0) {
      storyList.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-book-open"></i>
          <p>No stories found</p>
        </div>
      `;
      return;
    }

    try {
      const storiesHTML = await Promise.all(stories.map(async story => {
        let isFavorited = false;
        try {
          isFavorited = await isStoryFavorited(story.id);
        } catch (error) {
          console.warn('Error checking favorite status:', error);
        }
        
        return `
          <article class="story-card" data-story-id="${story.id}">
            <div class="story-card__image-container">
              <a href="#/stories/${story.id}" class="story-card__link">
                <img 
                  src="${story.photoUrl}" 
                  alt="Photo from ${story.name}'s story"
                  class="story-card__image"
                  loading="lazy"
                />
              </a>
            </div>
            <div class="story-card__content">
              <a href="#/stories/${story.id}" class="story-card__link">
                <h2 class="story-card__title">${story.name}</h2>
                <p class="story-card__description">${story.description}</p>
              </a>
              <div class="story-card__meta">
                <span class="story-card__date">
                  ${new Date(story.createdAt).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
                <button 
                  type="button"
                  class="btn-favorite ${isFavorited ? 'active' : ''}"
                  data-story-id="${story.id}"
                  aria-label="${isFavorited ? 'Remove from favorites' : 'Add to favorites'}"
                  ontouchstart="event.stopPropagation();"
                >
                  <i class="fas fa-heart"></i>
                </button>
              </div>
            </div>
          </article>`;
      }));

      storyList.innerHTML = storiesHTML.join('');

      // Add event listeners for favorite buttons
      const handleFavoriteClick = async (e) => {
        const favoriteButton = e.target.closest('.btn-favorite');
        if (!favoriteButton) return;

        // Prevent any default behavior and event bubbling
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        // Disable the button temporarily to prevent double clicks
        favoriteButton.disabled = true;

        const storyId = favoriteButton.dataset.storyId;
        const story = stories.find(s => s.id === storyId);
        
        if (!story) {
          showError('Story not found');
          favoriteButton.disabled = false;
          return;
        }

        try {
          // Reinitialize database if needed
          await initDB();
          
          const isFavorited = await isStoryFavorited(storyId);
          
          if (isFavorited) {
            const success = await removeFromFavorites(storyId);
            if (success) {
              favoriteButton.classList.remove('active');
              favoriteButton.setAttribute('aria-label', 'Add to favorites');
              showSuccess('Story removed from favorites');
            } else {
              throw new Error('Failed to remove from favorites');
            }
          } else {
            const success = await addToFavorites(story);
            if (success) {
              favoriteButton.classList.add('active');
              favoriteButton.setAttribute('aria-label', 'Remove from favorites');
              showSuccess('Story added to favorites');
            } else {
              throw new Error('Failed to add to favorites');
            }
          }
        } catch (error) {
          console.error('Error updating favorites:', error);
          showError('Failed to update favorites');
          // Try to reinitialize the database
          try {
            await initDB();
          } catch (dbError) {
            console.error('Failed to reinitialize database:', dbError);
          }
        } finally {
          // Re-enable the button
          favoriteButton.disabled = false;
        }
      };

      // Add both click and touch event listeners
      const favoriteButtons = storyList.querySelectorAll('.btn-favorite');
      favoriteButtons.forEach(button => {
        button.addEventListener('click', handleFavoriteClick);
        button.addEventListener('touchend', handleFavoriteClick);
      });
    } catch (error) {
      console.error('Error displaying stories:', error);
      storyList.innerHTML = `
        <div class="error-message">
          <p>Failed to display stories: ${error.message}</p>
          <button onclick="window.location.reload()" class="btn btn-primary">Retry</button>
        </div>
      `;
    }
  }
}