import Vue from 'vue';
import Vuex from 'vuex';
import alert from './modules/alert'
import user from './modules/user'
import navigation from './modules/navigation'
import selectValues from './modules/selectValues'

Vue.use(Vuex);

export const store = new Vuex.Store({
    modules: {
        alert,
        user,
        navigation,
        selectValues,
    }
})

