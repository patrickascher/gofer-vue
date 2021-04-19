<script>
import {VTextarea} from 'vuetify/lib'


import InputBase from '@/lib-components/grid/inputs/Base'
import {validation} from '@/lib-components/grid/mixins/validation'

export default {
  components: {
    VTextarea
  },
  extends: InputBase,
  mixins: [validation],
  data() {
    return {}
  }
}
</script>

<template>
  <v-textarea
      :disabled="isReadOnly()"
      :label="getLabel"
      :hint="field.description"
      :counter="counter"
      :auto-grow="true"
      :row-height="rowHeight"
      :rows="rows"

      v-model.lazy="fieldValue"
      v-show="!isHidden()"
      :rules=rules
      :dense="dense"
      :filled="filled"
      :outlined="outlined"

  >
  </v-textarea>
</template>
