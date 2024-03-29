import {USER} from "./../store/modules/types";
import {http} from './http'
import {store} from "./../store"
import {i18nService} from "@/lib-components/services/i18n";
import {Config} from "@/lib-components";

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
    setRedirectAfterLoginPath,
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
let UrlAfterLogin = "/dash"

function redirectLogin() {
    this.$router.push(UrlLogin)
}

function setRedirectAfterLoginPath(path){
    UrlAfterLogin = path
}

// login returns a Promise if the login was successful or failed
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
                localStorage.setItem(localStorageName(), JSON.stringify(response.data.claim));
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

    let redirect = store.getters['user/' + USER.REDIRECT]
    if(redirect!==null&& redirect!==""&&redirect!==UrlLogin){
        store.commit("user/" + USER.REDIRECT, null);
        return redirect
    }

    return UrlAfterLogin
}

function getUser() {
    return store.getters['user/' + USER.GET_DATA]
}

function localStorageName(){
    return Config.get('webserver.app.name')+'_user'
}

function initUser() {
    try {

        if (localStorage.getItem(localStorageName()) != null) {
            let userdata = JSON.parse(localStorage.getItem(localStorageName()))
            store.commit("user/" + USER.SET_DATE, userdata);
            if (_.get(userdata.Options, "Language", false)!==false) {
                i18nService.loadLanguageAsync(userdata.Options.Language,false)
            }
            return userdata
        }
        return null
    } catch (err) {
        removeUserStores();
        return null
    }
}

function removeUserStores() {
    if (localStorage.getItem(localStorageName()) != null) {
        localStorage.removeItem(localStorageName());
    }
    store.commit("user/" + USER.UNSET_DATA);
}
