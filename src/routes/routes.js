import auth from '../utils/auth';

// Pages
import HomePage from '../pages/home/home-page';
import LoginPage from '../pages/auth/login/login-page';
import RegisterPage from '../pages/auth/register/register-page';
import AddStoryPage from '../pages/auth/stories/addStory-page';
import ReportCardPage from "../pages/report-card/report-card";
import StoryListPage from "../pages/story-list/story-list";
import NotFoundPage from '../pages/not-found/not-found';
import AddGuestStoryPage from '../pages/guest/addGuestStory-page';

// Menyusun semua halaman dalam satu objek routes
const routes = {
  "#/": HomePage,
  "#/stories": StoryListPage,
  "#/stories/add": AddStoryPage,
  "#/stories/guest": AddGuestStoryPage,
  "#/stories/:id": ReportCardPage,
  "#/login": LoginPage,
  "#/register": RegisterPage,
  "#/not-found": NotFoundPage,
};

// Fungsi untuk mencocokkan rute dengan path yang diberikan
const matchRoute = (hashPath) => {
  // Jika path kosong, redirect ke home
  if (!hashPath || hashPath === '#') {
    return routes["#/"];
  }

  // Cek exact match dulu
  if (routes[hashPath]) {
    return routes[hashPath];
  }

  // Cek pola dinamis untuk stories
  if (hashPath.startsWith('#/stories/') && hashPath.split('/').length === 3) {
    const id = hashPath.split('/')[2];
    if (id && id !== 'add' && id !== 'guest') {
      return routes["#/stories/:id"];
    }
  }

  // Route tidak ditemukan
  return routes["#/not-found"];
};

// Helper function untuk extract ID dari route
const extractIdFromPath = (hashPath) => {
  const path = hashPath.startsWith('#') ? hashPath.slice(1) : hashPath;
  const segments = path.split("/");
  
  if (segments.length === 3 && (segments[1] === "stories" || segments[1] === "reports")) {
    return segments[2];
  }
  
  return null;
};

// Helper function untuk extract route type
const getRouteType = (hashPath) => {
  const path = hashPath.startsWith('#') ? hashPath.slice(1) : hashPath;
  const segments = path.split("/");
  
  if (segments.length === 3) {
    return segments[1]; // "stories" atau "reports"
  }
  
  return null;
};

const guardRoute = (hashPath) => {
  const protectedRoutes = ['#/stories/add', '#/stories'];
  const publicRoutes = ['#/', '#/login', '#/register', '#/stories/guest'];
  
  const userIsLoggedIn = auth.isUserLoggedIn();

  if (protectedRoutes.includes(hashPath) && !userIsLoggedIn) {
    window.location.hash = '#/login';
    return false;
  }

  if (publicRoutes.includes(hashPath) && userIsLoggedIn && hashPath !== '#/') {
    window.location.hash = '#/stories';
    return false;
  }

  return true;
};

export { routes, matchRoute, extractIdFromPath, getRouteType, guardRoute };

// export { routes, matchRoute, extractIdFromPath, getRouteType };