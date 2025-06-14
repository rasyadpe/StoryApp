// Fungsi untuk memisahkan path menjadi segmen-segmen berdasarkan tanda "/"
function splitPathIntoSegments(path) {
  const segments = path.split("/");
  return {
    resourceName: segments[1] || null,
    resourceId: segments[2] || null,
  };
}

// Fungsi untuk membangun URL atau route berdasarkan segmen yang diberikan
function buildRouteFromSegments(segments) {
  let route = "";

  if (segments.resourceName) {
    route = route.concat(`/${segments.resourceName}`);
  }

  if (segments.resourceId && segments.resourceName === "stories") {
    route = route.concat("/:id");
  }

  return route || "/";
}

// Mendapatkan pathname aktif berdasarkan hash URL
export function getCurrentPathname() {
  return location.hash.replace("#", "") || "/";
}

// Mendapatkan route aktif berdasarkan pathname
export function getCurrentRoute() {
  const pathname = getCurrentPathname();
  const segments = splitPathIntoSegments(pathname);
  return buildRouteFromSegments(segments);
}

// Mengurai pathname aktif menjadi segmen-segmen
export function extractCurrentPathname() {
  const pathname = getCurrentPathname();
  return splitPathIntoSegments(pathname);
}

// Membuat route berdasarkan pathname yang diberikan
export function createRouteFromPathname(pathname) {
  const segments = splitPathIntoSegments(pathname);
  return buildRouteFromSegments(segments);
}

// Mengurai pathname menjadi segmen-segmen
export function parsePathnameSegments(pathname) {
  return splitPathIntoSegments(pathname);
}
