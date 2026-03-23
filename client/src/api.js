import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const BASE_URL = 'http://127.0.0.1:5000'; // USB + adb reverse only

const api = axios.create({ baseURL: BASE_URL, timeout: 60000 }); // longer for uploads
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(undefined, (e) => {
  console.log('API ERROR →', e.message, e.code, e.response?.status);
  return Promise.reject(e);
});
export { api };
export default api;
