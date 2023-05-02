import {GRID, USER} from './types'

const state = {
    reload: null
};


const getters = {
    [GRID.RELOAD]: state => {
        return state.reload
    },
};

const mutations = {
    [GRID.RELOAD]: (state) => {
        state.reload = true;
    },
    [GRID.CLEAR]: (state) => {
        state.reload = null;
    }
};

export default {
    namespaced: true,
    state,
    getters,
    mutations
};
