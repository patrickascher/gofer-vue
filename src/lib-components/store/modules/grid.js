import {GRID} from './types'

const state = {
    reload: null
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
    mutations
};
