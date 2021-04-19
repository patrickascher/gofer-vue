<script>
import {VDatePicker, VFlex, VLayout, VMenu, VTextField, VTooltip} from 'vuetify/lib'
import InputBase from '@/lib-components/grid/inputs/Base'
import {validation} from '@/lib-components/grid/mixins/validation'
import {mask} from 'vue-the-mask'

export default {
  components: {VLayout, VFlex, VMenu, VTextField, VDatePicker, VTooltip},
  directives: {mask},
  extends: InputBase,
  mixins: [validation],
  data() {
    return {
      displayMenu: false,
    }
  },
  computed: {
    datepickerValue: {
      get() {
        if (this.fieldValue == null || this.fieldValue === "0001-01-01T00:00:00Z") { //  prt or zero value of golangs time.Time
          return null
        }
        return this.fieldValue.slice(0, 10)
      },
      set(newValue) {
        let originalValue = this.fieldValue;
        if (this.fieldValue === null) {
          originalValue = "0000-00-00T00:00:00Z"
        }
        let time = originalValue.substr(originalValue.indexOf('T'));
        this.fieldValue = newValue + time
      }
    },
    timepickerValue: {
      get() {
        if (this.fieldValue == null) {
          return null
        }
        return this.fieldValue.slice(this.fieldValue.indexOf('T') + 1, this.fieldValue.indexOf('Z') - 3)
      },
      set(newValue) {
        if (this.fieldValue != null) {
          let originalValue = this.fieldValue;
          let date = originalValue.substr(0, originalValue.indexOf('T') + 1);

          let second = (!this.field.seconds) ? ":00Z" : ":Z";
          this.fieldValue = date + newValue + second
        }
      }
    },
  }
}
</script>

<template>
  <v-layout v-show="!isHidden()" row wrap>
    <v-flex>
      <v-menu v-if="isType(FieldType.Date) ||isType(FieldType.DateTime)"
              :close-on-content-click="false"
              :nudge-right="40"
              v-model="displayMenu"
              transition="scale-transition"
              offset-y
              min-width="290px"
      >
        <template v-slot:activator="{ on }">
          <v-text-field
              :disabled="isReadOnly()"
              v-model="datepickerValue"
              :label="getLabelDate"
              prepend-icon="mdi-calendar"
              readonly
              :rules="rules"
              v-on="on"
          ></v-text-field>
        </template>

        <v-date-picker v-model="datepickerValue" @input="displayMenu = false"></v-date-picker>
      </v-menu>
    </v-flex>

    <!-- Time, DateTime -->
    <v-tooltip bottom>
      <template v-slot:activator="{ on }">
        <div style="display:inline" v-on="isType(FieldType.DateTime)&&datepickerValue==null?on:null">
          <v-text-field v-if="isType(FieldType.Time) ||isType(FieldType.DateTime)"
                        v-model="timepickerValue"
                        :label="getLabelTime"
                        prepend-icon="mdi-clock-outline"
                        return-masked-value
                        :disabled="isReadOnly()||isType(FieldType.DateTime)&&datepickerValue==null"
                        :rules="rules"

                        v-mask="field.seconds?'##:##:##':'##:##'"
                        masked="true"
          >
          </v-text-field>
        </div>
      </template>
      <span>Please select a date first!</span>
    </v-tooltip>
  </v-layout>
</template>
