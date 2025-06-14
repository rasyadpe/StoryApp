import L from "leaflet";
import ReportCardPresenter from "../../presenters/reportCardPresenter"; // Add proper import path
import StoryPresenter from '../../presenters/storyPresenter';

export default function ReportCardPage() {
  const storyPresenter = new StoryPresenter();
  const storyId = window.location.hash.split('/')[2];
  
  document.querySelector('#main-content').innerHTML = `
    <div class="container">
      <div id="story-detail" class="story-detail">
        <div class="loading">Loading story...</div>
      </div>
    </div>
  `;

  // Fetch and display story detail
  fetchStoryDetail();

  async function fetchStoryDetail() {
    try {
      const story = await storyPresenter.getStoryDetail(storyId);
      displayStoryDetail(story);
    } catch (error) {
      document.querySelector('#story-detail').innerHTML = `
        <div class="error-message">
          <p>${error.message}</p>
          <a href="#/stories" class="btn btn-primary">Back to Stories</a>
        </div>
      `;
    }
  }

  function displayStoryDetail(story) {
    document.querySelector('#story-detail').innerHTML = `
      <div class="story-detail__header">
        <h1 class="story-detail__title">${story.name}</h1>
        <div class="story-detail__meta">
          <span class="story-detail__date">
            ${new Date(story.createdAt).toLocaleDateString('id-ID', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
        </div>
      </div>

      <div class="story-detail__content">
        <img 
          src="${story.photoUrl}" 
          alt="Photo for ${story.name}'s story"
          class="story-detail__image"
        >
        <p class="story-detail__description">${story.description}</p>
      </div>

      ${story.lat && story.lon ? `
        <div class="story-detail__map">
          <h2>Location</h2>
          <div id="map" class="map-container"></div>
        </div>
      ` : ''}

      <div class="story-detail__actions">
        <a href="#/stories" class="btn btn-primary">Back to Stories</a>
      </div>
    `;

    // Initialize map if location exists
    if (story.lat && story.lon) {
      const map = L.map('map').setView([story.lat, story.lon], 13);

      // Define tile layers
      const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        name: 'OpenStreetMap'
      });

      const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '© Esri',
        name: 'Satellite'
      });

      const topoLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenTopoMap contributors',
        name: 'Topographic'
      });

      const darkLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© CartoDB',
        name: 'Dark Mode'
      });

      // Create base layers object
      const baseLayers = {
        "OpenStreetMap": osmLayer,
        "Satellite": satelliteLayer,
        "Topographic": topoLayer,
        "Dark Mode": darkLayer
      };

      // Add default layer
      osmLayer.addTo(map);

      // Add layer control
      L.control.layers(baseLayers, null, {
        collapsed: false
      }).addTo(map);

      // Add marker
      L.marker([story.lat, story.lon])
        .bindPopup(`<b>${story.name}</b><br>${story.description}`)
        .addTo(map);
    }
  }
}