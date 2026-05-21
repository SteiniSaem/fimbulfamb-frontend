import axios from 'axios';

const api = axios.create({
    baseURL: "http://localhost:8000/",
    timeout: 5000
});

// Intercept every request and attach the token if it exists
/*
api.interceptors.request.use((config) => {
    const user = get(currentUser);
    if (user && user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
});*/

export default api;