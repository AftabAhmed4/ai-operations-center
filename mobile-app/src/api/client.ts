import axios from 'axios';

// ─── Config ───────────────────────────────────────────────────────────────────
// IMPORTANT: "localhost" only works in the iOS simulator.
// For a physical device (Android or iPhone): use your PC's WiFi IP from `ipconfig`.
// For Android emulator: use 'http://10.0.2.2:8000' instead.
// Current PC WiFi IP: run `ipconfig` → look for IPv4 under your WiFi adapter.
export const BASE_URL = 'http://192.168.100.6:8000';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});
