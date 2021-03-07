import {LANGUAGES} from './types'
import {i18nService} from './../../services/i18n'

const state = {
    availableLangs: null,
};

const getters = {
    [LANGUAGES.GET_LANGUAGES]: state => {
        return state.availableLangs
    }
};

const mutations = {
    [LANGUAGES.SET_LANGUAGES]: (state, languages) => {
        state.availableLangs = languages
    },
    [LANGUAGES.SET_LOCALE]: (state, language) => {
        i18nService.loadLanguageAsync(language, false)
    },
};

export default {
    namespaced: true,
    state,
    getters,
    mutations
};
