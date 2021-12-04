import Vue from "vue";
import {userService,UrlLogin} from '@/lib-components/services/user'
import axios from 'axios';

export const http = axios.create({
    baseURL: null,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

// on unauthorized access - redirect to login
http.interceptors.response.use(function (response) {
    return response
}, function (error) {
    // jwt token expired or is not set
    if (error.response.status === 401) {
        userService.removeUserStores();
        Vue.$router.push(UrlLogin)
        error.message = "please re-login, its already too long since the last login."
    }
    return Promise.reject(error);
});

