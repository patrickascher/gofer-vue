import {ALERT} from './types'

const state = {
    color: null,
    message: null
};

const mutations = {
    [ALERT.SUCCESS]: (state, message) => {
        state.color = 'success';
        state.message = message
    },
    [ALERT.INFO]: (state, message) => {
        state.color = 'info';
        state.message = message
    },
    [ALERT.ERROR]: (state, message) => {
        state.color = 'error';
        state.message = message
    },
    [ALERT.CLEAR]: (state) => {
        state.color = null;
        state.message = null
    }
};

export default {
    namespaced: true,
    state,
    mutations
};