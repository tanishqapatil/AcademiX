// client/src/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// USB (adb reverse) — device hits your PC on localhost
export const BASE_URL = __DEV__ ? 'http://127.0.0.1:5000' : 'https://your-deployment.example.com';

const api = axios.create({ baseURL: BASE_URL, timeout: 15000 });

api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {}
  return config;
});

export { api };
export default api;
