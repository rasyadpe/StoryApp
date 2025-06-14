import StoryPresenter from '../../../presenters/storyPresenter';
import { showLoading, closeLoading, showError, showSuccess } from '../../../utils/swalHelper';

export default function AddStoryPage() {
  const storyPresenter = new StoryPresenter();
  let mediaStream = null;
  
  document.querySelector('#main-content').innerHTML = `
    <div class="container">
      <h1 class="page-title">Add New Story</h1>
      <form id="add-story-form" class="form">
        <div class="form-group">
          <label for="description">Description</label>
          <textarea 
            id="description" 
            name="description" 
            class="form-control" 
            required
            rows="4"
          ></textarea>
        </div>
        
        <div class="form-group">
          <label>Photo</label>
          <div class="photo-input-options">
            <div class="file-option">
              <input 
                type="file" 
                id="photo" 
                name="photo" 
                class="form-control" 
                accept="image/*"
              >
            </div>
            <div class="camera-option">
              <select id="camera-select" class="form-control" style="margin-bottom: 10px; display: none;">
                <option value="">Select Camera</option>
              </select>
              <button type="button" id="start-camera" class="btn btn-secondary">Use Camera</button>
              <button type="button" id="capture-photo" class="btn btn-primary" style="display: none;">Take Photo</button>
              <button type="button" id="retry-photo" class="btn btn-secondary" style="display: none;">Retake</button>
            </div>
          </div>
          <video id="camera-preview" class="camera-preview" style="display: none;" autoplay playsinline></video>
          <canvas id="photo-canvas" style="display: none;"></canvas>
          <div id="image-preview" class="image-preview"></div>
        </div>
        
        <div class="form-group">
          <label>Location</label>
          <div id="map" class="map-container"></div>
          <p id="coordinates" class="coordinate-display">Click on the map to set location</p>
          <input type="hidden" id="lat" name="lat">
          <input type="hidden" id="lon" name="lon">
        </div>
        
        <button type="submit" class="btn btn-primary">Post Story</button>
      </form>
    </div>
  `;

  // Initialize map with multiple tile layers
  const map = L.map('map').setView([-6.200000, 106.816666], 5);

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

  let marker = null;

  // Handle map click
  map.on('click', (e) => {
    const { lat, lng } = e.latlng;
    
    if (marker) {
      marker.setLatLng([lat, lng]);
    } else {
      marker = L.marker([lat, lng]).addTo(map);
    }

    document.getElementById('lat').value = lat;
    document.getElementById('lon').value = lng;
    
    document.getElementById('coordinates').textContent = 
      `Latitude: ${lat.toFixed(6)}, Longitude: ${lng.toFixed(6)}`;
  });

  // Camera handling
  const startCameraButton = document.getElementById('start-camera');
  const capturePhotoButton = document.getElementById('capture-photo');
  const retryPhotoButton = document.getElementById('retry-photo');
  const videoElement = document.getElementById('camera-preview');
  const photoCanvas = document.getElementById('photo-canvas');
  const imagePreview = document.getElementById('image-preview');
  const photoInput = document.getElementById('photo');
  const cameraSelect = document.getElementById('camera-select');

  // Get available cameras
  async function getCameraDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      if (videoDevices.length > 0) {
        cameraSelect.innerHTML = '<option value="">Select Camera</option>' +
          videoDevices.map(device => 
            `<option value="${device.deviceId}">${device.label || `Camera ${cameraSelect.length + 1}`}</option>`
          ).join('');
        cameraSelect.style.display = 'block';
      }
      
      return videoDevices;
    } catch (error) {
      console.error('Error getting camera devices:', error);
      showError('Failed to get camera devices');
      return [];
    }
  }

  startCameraButton.addEventListener('click', async () => {
    const devices = await getCameraDevices();
    if (devices.length === 0) {
      showError('No camera devices found');
      return;
    }
    
    cameraSelect.style.display = 'block';
    startCameraButton.textContent = 'Start Selected Camera';
    
    if (devices.length === 1) {
      startCamera(devices[0].deviceId);
    }
  });

  cameraSelect.addEventListener('change', async (event) => {
    if (event.target.value) {
      await startCamera(event.target.value);
    }
  });

  async function startCamera(deviceId) {
    try {
      if (mediaStream) {
        stopCameraStream();
      }

      mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined
        },
        audio: false
      });

      videoElement.srcObject = mediaStream;
      videoElement.style.display = 'block';
      startCameraButton.style.display = 'none';
      capturePhotoButton.style.display = 'inline-block';
      photoInput.value = '';
    } catch (error) {
      showError('Error accessing camera: ' + error.message);
    }
  }

  capturePhotoButton.addEventListener('click', () => {
    const context = photoCanvas.getContext('2d');
    photoCanvas.width = videoElement.videoWidth;
    photoCanvas.height = videoElement.videoHeight;
    context.drawImage(videoElement, 0, 0, photoCanvas.width, photoCanvas.height);
    
    const photoData = photoCanvas.toDataURL('image/jpeg');
    imagePreview.innerHTML = `<img src="${photoData}" class="preview-image">`;
    
    stopCameraStream();
    videoElement.style.display = 'none';
    capturePhotoButton.style.display = 'none';
    retryPhotoButton.style.display = 'inline-block';
    cameraSelect.style.display = 'none';
  });

  retryPhotoButton.addEventListener('click', () => {
    imagePreview.innerHTML = '';
    startCameraButton.style.display = 'inline-block';
    retryPhotoButton.style.display = 'none';
    cameraSelect.style.display = 'none';
  });

  photoInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreview.innerHTML = `<img src="${e.target.result}" class="preview-image">`;
      };
      reader.readAsDataURL(file);
      
      if (mediaStream) {
        stopCameraStream();
      }
      videoElement.style.display = 'none';
      capturePhotoButton.style.display = 'none';
      retryPhotoButton.style.display = 'none';
      startCameraButton.style.display = 'inline-block';
      cameraSelect.style.display = 'none';
    }
  });

  function stopCameraStream() {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      mediaStream = null;
    }
  }

  // Handle form submission
  const form = document.getElementById('add-story-form');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const formData = new FormData();
    formData.append('description', form.description.value);

    // Get photo from either file input or canvas
    if (photoInput.files.length > 0) {
      formData.append('photo', photoInput.files[0]);
    } else {
      // Convert canvas data to file
      const dataUrl = photoCanvas.toDataURL('image/jpeg', 0.8);
      const blob = await (await fetch(dataUrl)).blob();
      formData.append('photo', blob, 'camera-photo.jpg');
    }
    
    // Add location if available
    if (form.lat.value && form.lon.value) {
      formData.append('lat', form.lat.value);
      formData.append('lon', form.lon.value);
    }

    try {
      showLoading('Posting your story...');
      await storyPresenter.addStory(formData);
      stopCameraStream();
      closeLoading();
      await showSuccess('Story posted successfully!');
      window.location.hash = '#/stories';
    } catch (error) {
      closeLoading();
      showError(error.message || 'Failed to post story');
    }
  });

  // Clean up on page unload
  window.addEventListener('beforeunload', () => {
    stopCameraStream();
  });
}
