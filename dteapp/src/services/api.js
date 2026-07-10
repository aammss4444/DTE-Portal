import axios from 'axios';

// Bypass ngrok browser warning for free URLs
// axios.defaults.headers.common['ngrok-skip-browser-warning'] = '69420';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
    // 'ngrok-skip-browser-warning':true
    // Add other common headers as needed
    // 'Accept': 'application/json',
  },
});

// Request Interceptor: Add Authorization header and ngrok bypass
api.interceptors.request.use(
  (config) => {
    // Add ngrok bypass as a query parameter (safer for CORS)
    const separator = config.url.includes('?') ? '&' : '?';
    // config.url = `${config.url}${separator}ngrok-skip-browser-warning=69420`;

    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor: Handle errors globally and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Avoid infinite loops if the refresh endpoint itself returns 401
    if (originalRequest.url.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({resolve, reject});
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh_token');
      
      if (!refreshToken) {
        isRefreshing = false;
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_data');
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${api.defaults.baseURL || 'http://localhost:3000/api'}/auth/refresh`, {
          refresh_token: refreshToken
        }, {
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': '69420'
          }
        });

        localStorage.setItem('auth_token', data.access_token);
        if (data.refresh_token) {
            localStorage.setItem('refresh_token', data.refresh_token);
        }

        api.defaults.headers.common['Authorization'] = 'Bearer ' + data.access_token;
        originalRequest.headers['Authorization'] = 'Bearer ' + data.access_token;

        processQueue(null, data.access_token);
        isRefreshing = false;

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;

        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_data');
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
