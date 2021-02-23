import {USER} from './types'

const state = {
    user: null,
    redirect: ''
};

const getters = {
    [USER.GET_DATA]: state => {
        return state.user
    },
    [USER.REDIRECT]: state => {
        return state.redirect
    }
};

const mutations = {
    [USER.SET_DATE]: (state, user) => {
        state.user = user
    },
    [USER.UNSET_DATA]: (state) => {
        state.user = null
    },
    [USER.REDIRECT]: (state, redirect) => {
        state.redirect = redirect
    },
};

export default {
    namespaced: true,
    state,
    getters,
    mutations
};