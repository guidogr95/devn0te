import axios from "axios";
import { DEVICE_ID_KEY, TOKEN_KEY } from "devnote/core/constants/storage";
import LocalStorage from "devnote/core/local-storage";

const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/v1`
});

axiosInstance.interceptors.request.use(
  (config) => {
    if (config.url !== "/login") {
      const token = LocalStorage.getItem(TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      let deviceId = LocalStorage.getItem<string>(DEVICE_ID_KEY);
      if (!deviceId) {
        deviceId = crypto.randomUUID();
        LocalStorage.setItem(DEVICE_ID_KEY, deviceId);
      }
      config.headers["X-Device-Id"] = deviceId;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
