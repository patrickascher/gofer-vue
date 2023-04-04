<script>
import {VTextField} from 'vuetify/lib'


import InputBase from '@/lib-components/grid/inputs/Base'
import {validation} from '@/lib-components/grid/mixins/validation'

export default {
  components:{
    VTextField
  },
  extends: InputBase,
  mixins: [validation],
  props: ["api"],
  data() {
    return {}
  },
  methods: {
    keyhandlerInteger: function (event) {
      if (event.key === "e" || event.key === "+" || event.key === "E" || event.key === "," || event.key === ".") {
        event.preventDefault();
      }
    },
  },
  computed: {
    fieldValue: {
      get() {
        return this.value;
      },
      set(newValue) {
        //cast string to number, create null on empty input for the backend
        if (this.isType(this.FieldType.Integer) || this.isType(this.FieldType.Float)) {
          let number = parseFloat(newValue);
          newValue = !isNaN(number) ? number : null
        }
        this.$emit('input', newValue);
      }
    }
  }
}
</script>

<template>
  <v-text-field
      autocomplete="off"
      :disabled="isReadOnly()"
      :label="getLabel"
      :hint="field.description"
      :required="required"
      :counter="counter"
      :type="isType(FieldType.Text)||isType(FieldType.Password)?(email!==true?(isType(FieldType.Password)?'password':'text'):'email'):'number'"
      @keydown="e => isType(FieldType.Integer) && keyhandlerInteger(e)"
      :validate-on-blur="true"

      v-model.lazy="fieldValue"
      v-show="!isHidden()"
      :rules=rules
      :error-messages="errorMessages"

      :single-line="singleLine"
      :dense="dense"
      :filled="filled"
      :outlined="outlined"
  >
  </v-text-field>
</template>
