<script>
import Vue from 'vue';
// Uncomment import and local "components" registration if library is not registered globally.
// import { GoferVueSample } from '@/entry.esm';
import {FccButton} from '@/entry.esm';

export default Vue.extend({
  name: 'ServeDev',
  components: {
    FccButton
  }
});
</script>

<template>
  <div id="app">
    <gofer-vue-sample/>
    <fcc-button></fcc-button>
  </div>
</template>
