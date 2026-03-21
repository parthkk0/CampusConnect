const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || `http://${window.location.hostname}:5000/api`;
const FACE_SERVICE_URL = import.meta.env.VITE_FACE_SERVICE_URL || `http://${window.location.hostname}:8000`;

export { BACKEND_URL, FACE_SERVICE_URL };