import Vue from 'vue';
import Vuex from 'vuex';
import alert from './modules/alert'
import user from './modules/user'
import navigation from './modules/navigation'
import selectValues from './modules/selectValues'
import languages from './modules/languages'

Vue.use(Vuex);

export const store = new Vuex.Store({
    modules: {
        alert,
        user,
        navigation,
        selectValues,
        languages
    }
})

