import axios from 'axios';

export const http = axios.create({
    baseURL: process.env.VUE_APP_API,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

