import {SELECT} from './types'

const state = {
    cache: [],
    loading: [],
};

const getters = {
    [SELECT.GET_DATA]: (state, field) => {
        return state.cache[field]
    },
    [SELECT.GET_LOADING]: (state, field) => {
        if (!field in state.loading) {
            return false
        }
        return state.loading[field]
    },
};

const mutations = {
    [SELECT.SET_LOADING]: (state, field) => {
        state.loading[field] = true
    },
    [SELECT.UNSET_LOADING]: (state, field) => {
        delete state.loading[field]
    },
    [SELECT.SET_DATA]: (state, payload) => {
        state.cache[payload.field] = payload.data
    },
    [SELECT.UNSET_DATA]: (state) => {
        state.cache = []
    },
};

export default {
    namespaced: true,
    state,
    getters,
    mutations
};
