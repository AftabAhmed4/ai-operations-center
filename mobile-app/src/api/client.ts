import axios from 'axios';

// ─── Config ───────────────────────────────────────────────────────────────────
// Set this to your PC's local IP address when testing on a physical device.
// Find it with `ipconfig` (Windows) — look for IPv4 Address under your WiFi adapter.
// Example: 'http://192.168.1.5:8000'
export const BASE_URL = 'http://192.168.100.9:8000';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});
