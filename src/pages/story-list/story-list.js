import StoryPresenter from '../../presenters/storyPresenter';
import { addData, getAllData } from '../../utils/indexed-db-helper';

export default function StoryListPage() {
  const storyPresenter = new StoryPresenter();
  
  document.querySelector('#main-content').innerHTML = `
    <div class="container">
      <h1>Stories</h1>
      <div class="story-list__items" id="storyList">
        <div class="loading">Loading stories...</div>
      </div>
    </div>
  `;

  // Fetch and display stories
  fetchStories();

  async function fetchStories() {
    try {
      const stories = await storyPresenter.getAllStories();
      // Store stories in IndexedDB
      stories.forEach(story => addData(story));
      displayStories(stories);
    } catch (error) {
      console.error('Error fetching stories from network:', error);
      // Fallback to IndexedDB if network fails
      try {
        const cachedStories = await getAllData();
        if (cachedStories.length > 0) {
          console.log('Displaying stories from IndexedDB');
          displayStories(cachedStories);
        } else {
          document.querySelector('#storyList').innerHTML = `
            <div class="error-message">
              <p>Tidak ada cerita yang ditemukan di cache dan Anda sedang offline.</p>
            </div>
          `;
        }
      } catch (indexedDBError) {
        console.error('Error fetching stories from IndexedDB:', indexedDBError);
        document.querySelector('#storyList').innerHTML = `
          <div class="error-message">
            <p>Gagal memuat cerita: ${error.message}. Coba lagi nanti.</p>
          </div>
        `;
      }
    }
  }

  function displayStories(stories) {
    const storyList = document.querySelector('#storyList');
    
    if (!stories || stories.length === 0) {
      storyList.innerHTML = '<p>No stories found</p>';
      return;
    }

    storyList.innerHTML = stories.map(story => `
      <article class="story-item">
        <img 
          src="${story.photoUrl}" 
          alt="Photo for ${story.name}'s story" 
          class="story-item__image"
          loading="lazy"
        >
        <div class="story-item__content">
          <h2 class="story-item__title">${story.name}</h2>
          <p class="story-item__description">${story.description}</p>
          <div class="story-item__meta">
            <span class="story-item__date">${new Date(story.createdAt).toLocaleDateString('id-ID', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</span>
          </div>
          <a href="#/stories/${story.id}" class="btn btn-primary">Read More</a>
        </div>
      </article>
    `).join('');
  }
}