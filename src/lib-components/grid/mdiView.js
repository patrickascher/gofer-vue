import Vue from 'vue'
import {VIcon} from 'vuetify/lib'

Vue.component('MdiView', {
    props: ['value'],
    components:{
        VIcon
    },
    data: function () {
        return {
        }
    },
    template: '<v-icon>{{value}}</v-icon>'
});
