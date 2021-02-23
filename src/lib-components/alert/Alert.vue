<script>
import {VBtn, VSnackbar} from 'vuetify/lib'
import {store} from "../store";
import {ALERT} from "../store/modules/types";

export default {
  components: {
    VSnackbar, VBtn
  },
  data() {
    return {
      show: false,
      color: '',
      message: '',
      timeout: 5000,
      btn: true
    }
  },
  created: function () {
    store.watch(state => state.alert.message, () => {
      let msg = store.state.alert.message;
      let color = store.state.alert.color;

      if (msg !== null) {

        // show if response has a json error message, otherwise show the normal error message.
        // if only a string was set, the string will be displayed.
        if (typeof msg.response !== 'undefined' && msg.response.hasOwnProperty('data') && msg.response.data.hasOwnProperty('error')) {
          msg = msg.response.data.error
        } else if (msg.hasOwnProperty('message')) {
          msg = msg.message
        }

        this.show = true;
        this.message = msg;
        this.color = color;
        store.commit('alert/' + ALERT.CLEAR)
      }
    })
  }
}
</script>

<template>
  <v-snackbar right top :timeout="timeout" :color="color" v-model="show">
    {{ message }}
    <v-btn v-if="btn" text @click.native="show = false">Close</v-btn>
  </v-snackbar>
</template>
