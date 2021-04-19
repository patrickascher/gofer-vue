import axios from 'axios';

export const http = axios.create({
    baseURL: null,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

