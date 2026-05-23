import { PUBLIC_API_URL } from '$env/static/public';
import axios from 'axios';

//export const WS_URL = "ws://localhost:8000"
//export const WS_URL = "ws://192.168.3.42:8000"

const api = axios.create({
    baseURL: PUBLIC_API_URL,
    //baseURL: "http://192.168.3.42:8000",
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