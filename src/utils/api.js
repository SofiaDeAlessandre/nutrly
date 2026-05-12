const BASE = process.env.NODE_ENV === 'development'
  ? 'http://localhost:8888/.netlify/functions'
  : '/.netlify/functions';

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Error inesperado');
  }
  return data;
}

export const api = {
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  get:  (path) => request(path),
  put:  (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
};

// Auth
export const authApi = {
  login:    (email, password) => api.post('/auth-login', { email, password }),
  register: (name, email, password) => api.post('/auth-register', { name, email, password }),
};

// Meal plans
export const plansApi = {
  getAll:  () => api.get('/meal-plans'),
  getMonth: (month) => api.get(`/meal-plans?month=${month}`),
  save:    (data) => api.post('/meal-plans', data),
};

// Daily logs
export const logsApi = {
  getDate:  (date) => api.get(`/daily-logs?date=${date}`),
  getRange: (from, to) => api.get(`/daily-logs?from=${from}&to=${to}`),
  save:     (data) => api.post('/daily-logs', data),
};

// Weight logs
export const weightApi = {
  getAll:  () => api.get('/weight-logs'),
  add:     (data) => api.post('/weight-logs', data),
  remove:  (id) => request(`/weight-logs?id=${id}`, { method: 'DELETE' }),
};

// Profile
export const profileApi = {
  get:    () => api.get('/profile'),
  update: (data) => api.put('/profile', data),
};

// AI Summary
export const aiApi = {
  getSummary: (period, startDate, endDate) =>
    api.post('/ai-summary', { period, startDate, endDate }),
};
