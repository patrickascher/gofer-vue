import {NAVIGATION} from './types'

const state = {
    reload: null
};

const mutations = {
    [NAVIGATION.RELOAD]: (state) => {
        state.reload = true;
    },
    [NAVIGATION.CLEAR]: (state) => {
        state.reload = null;
    }
};

export default {
    namespaced: true,
    state,
    mutations
};
