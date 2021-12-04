import {USER} from "./../store/modules/types";
import {http} from './http'
import {store} from "./../store"

export const userService = {
    login,
    forgotPassword,
    changePassword,
    logout,
    navigation,
    initUser,
    getUser,
    setRedirectPath,
    redirectLogin,
    redirectAfterLoginPath,
    removeUserStores
};

// TODO create a config for these keys.
const ParamLogin = "login"
const ParamToken = "token"
const ParamPassword = "password"
const ParamProvider = "provider"

const ApiLogin = "/login"
const ApiLogout = "/logout"
const ApiForgotPW = "/pw/forgot"
const ApiChangePW = "/pw/change"

const ApiNavigation = "/navigation"
export const UrlLogin = "/"
const UrlLogout = "/logout"
const UrlAfterLogin = "/dash"

function redirectLogin() {
    this.$router.push(UrlLogin)
}

// login returns an Promise if the login was successful or failed
// the service is taking care of the api call, local storage and the store in vuex.
// on success it returns the decoded jwt and on fail it returns the error
function login(credentials, provider) {

    return new Promise(
        // The executor function is called with the ability to resolve or
        // reject the promise
        (resolve, reject) => {

            // HTTP Request
            let bodyFormData = new FormData();
            bodyFormData.set(ParamLogin, credentials.username);
            bodyFormData.set(ParamPassword, credentials.password);
            bodyFormData.set(ParamProvider, provider);

            http.post(ApiLogin, bodyFormData).then(response => {
                // Checking if token exists
                if (!response.data.claim) {
                    reject(new Error("user data was not found"));
                }

                // Add token to local storage
                localStorage.user = JSON.stringify(response.data.claim);
                let user = initUser();

                /// everything was ok
                resolve(user);
            })
                .catch(error => {
                    reject(error);
                });
        }
    );
}

function forgotPassword(form, provider) {
    return new Promise(
        (resolve, reject) => {
            // HTTP Request
            let bodyFormData = new FormData();
            bodyFormData.set(ParamLogin, form.username);
            bodyFormData.set(ParamProvider, provider);
            return http.post(ApiForgotPW, bodyFormData).then(response => {
                /// everything was ok
                resolve(response);
            })
                .catch(error => {
                    reject(error);
                });
        });
}

function changePassword(form, provider) {
    return new Promise(
        (resolve, reject) => {
            // HTTP Request
            let bodyFormData = new FormData();
            bodyFormData.set(ParamToken, form.token);
            bodyFormData.set(ParamLogin, form.username);
            bodyFormData.set(ParamPassword, form.password);
            bodyFormData.set(ParamProvider, provider);
            return http.post(ApiChangePW, bodyFormData).then(response => {
                /// everything was ok
                resolve(response);
            })
                .catch(error => {
                    reject(error);
                });
        });
}

function logout() {
    return new Promise(
        (resolve, reject) => {
            http.get(ApiLogout).then(() => {
                removeUserStores();
                resolve();
            }).catch((error) => {
                removeUserStores();
                reject(error);
            });
        });
}

function navigation() {
    return http.get(ApiNavigation)
}

function setRedirectPath(path) {
    store.commit("user/" + USER.REDIRECT, path);
}

function redirectAfterLoginPath() {
    return UrlAfterLogin
}

function getUser() {
    return store.getters['user/' + USER.GET_DATA]
}

function initUser() {
    try {
        if (localStorage.user != null) {
            let userdata = JSON.parse(localStorage.user)
            store.commit("user/" + USER.SET_DATE, userdata);
            return userdata
        }
        return null
    } catch (err) {
        removeUserStores();
        return null
    }
}

function removeUserStores() {
    if (localStorage.user != null) {
        localStorage.removeItem('user');
    }
    store.commit("user/" + USER.UNSET_DATA);
}
