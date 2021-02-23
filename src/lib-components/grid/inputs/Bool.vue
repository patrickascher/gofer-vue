<script>
import {VSwitch} from 'vuetify/lib'
import InputBase from '@/lib-components/grid/inputs/Base'
import {validation} from '@/lib-components/grid/mixins/validation'

export default {
  components: {VSwitch},
  props: ['index', 'parentData', 'parent'],
  extends: InputBase,
  mixins: [validation],
  data() {
    return {}
  }
}
</script>

<template>
  <v-switch
      :disabled="isReadOnly()"
      :label="getLabel()"
      :hint="field.description"
      v-model.lazy="fieldValue"
      v-show="!isHidden()"
      :rules=rules
      :dense="dense"
      :filled="filled"
      :outlined="outlined"
  >
  </v-switch>
</template>
