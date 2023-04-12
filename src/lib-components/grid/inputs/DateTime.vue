<script>
/**
 * NOTES
 * This module must be rewritten. It was a prototype.
 * All Functions and variables must be renamed and styled.
 * Filter with seconds must be implemented. only hours and minutes are developed so far.
 */
import {VDatePicker, VFlex, VLayout, VMenu,VRow,VCol, VTextField, VTooltip} from 'vuetify/lib'
import InputBase from '@/lib-components/grid/inputs/Base'
import {validation} from '@/lib-components/grid/mixins/validation'
import {mask} from 'vue-the-mask'

export default {
  components: {VLayout, VFlex,VRow,VCol, VMenu, VTextField, VDatePicker, VTooltip},
  directives: {mask},
  extends: InputBase,
  mixins: [validation],
  props:[
    "fromTo",
      "isFilter",
  ],
  data() {
    return {
      displayMenuFrom: false,
      displayMenuTo: false,
    }
  },
  methods:{
    getFilterDateLabel(field){
      if(this.fromTo){
        return this.$t('COMMON.'+field);
      }
      return this.getLabel
    },
  },
  computed: {
    minTo(){
      return this.datepickerValueFrom
    },
    maxFrom(){
      return this.datepickerValueTo
    },
    datepickerValueFrom: {
      get() {
        if (this.fromTo){
          if (this.fieldValue === null || typeof this.fieldValue === "undefined" || this.fieldValue ===""){
            return null
          }
          return this.fieldValue.split(",")[0].slice(0, 10)
        }

        if (this.fieldValue == null || this.fieldValue === "0001-01-01T00:00:00Z") { //  prt or zero value of golangs time.Time
          return null
        }
        return this.fieldValue.slice(0, 10)
      },
      set(newValue) {
        let originalValue = this.fieldValue;


        if (this.fromTo){
          if (typeof this.fieldValue==="undefined"){
            originalValue = ""
          }
          let tmp = originalValue.split(",")[0];
          if (tmp.indexOf('T')!==-1&&newValue!==null&&newValue.length>0){
            let time = tmp.substr(tmp.indexOf('T'));
            tmp = newValue +time
          }else{
            tmp = newValue
          }
          let toValue=""
          if (typeof originalValue.split(",")[1]!=="undefined"){
            toValue = ","+originalValue.split(",")[1]
          }
          let fromValue=""
          if(tmp!=null){
            fromValue = tmp
          }
          this.fieldValue = fromValue+toValue
          return
        }


        if (this.fieldValue === null && !this.isFilter) {
          originalValue = "0000-00-00T00:00:00Z"
        }else{
          originalValue = "0000-00-00"
        }
        // if its only a date
        if (originalValue.indexOf('T')!==-1){
          let time = originalValue.substr(originalValue.indexOf('T'));
          this.fieldValue = newValue +time
        }else{
          this.fieldValue = newValue
        }
      }
    },
    timepickerValueFrom: {
      get() {
        if (this.fieldValue == null || this.fieldValue.length ===10) {
          return null
        }
        if (this.fieldValue.indexOf(",")!==-1){
          let tmp = this.fieldValue.split(",")
          if (tmp[0] == null || tmp[0].length ===10) {
            return null
          }
          return tmp[0].slice(tmp[0].indexOf('T') + 1, tmp[0].indexOf('Z') - 3)
        }
        return this.fieldValue.slice(this.fieldValue.indexOf('T') + 1, this.fieldValue.indexOf('Z') - 3)
      },
      set(newValue) {
        let originalValue = this.fieldValue;
        if (this.fieldValue.indexOf(",")!==-1){
          let tmp = this.fieldValue.split(",")
          originalValue = tmp[0]
        }

        if (newValue.length===0){
          if(this.fieldValue.indexOf(",")===-1){
            this.fieldValue = this.fieldValue.substring(0,10)
          }else{
            let tmp = this.fieldValue.split(",")
            this.fieldValue = tmp[0].substring(0,10)+","+tmp[1]
          }
        }
        if(newValue.length !== 5 || (newValue!==8 && this.field.seconds)){
          return
        }

        if (this.fieldValue != null) {
          let nv =""
          if (originalValue.indexOf('T')!==-1){ // needed for GO, but not for quickfilter
            let date = originalValue.substr(0, originalValue.indexOf('T') + 1);
            let second = (!this.field.seconds) ? ":00Z" : ":Z";
            nv = date + newValue + second
          }else{
            nv = originalValue+"T"+newValue+":00Z"
          }

          if (this.fieldValue.indexOf(",")!==-1){
            let tmp = this.fieldValue.split(",")
            this.fieldValue = nv+","+tmp[1]
          }else{
            this.fieldValue = nv
          }

        }
      }
    },
    datepickerValueTo: {
      get() {
        if (this.fromTo){
          if (this.fieldValue=== null || typeof this.fieldValue === "undefined" || (typeof this.fieldValue.split(",")[1] === "undefined" && this.fromTo)){
            return null
          }
          return this.fieldValue.split(",")[1].slice(0, 10)
        }
      },
      set(newValue) {
        let originalValue = this.fieldValue;
        if (this.fromTo){
          let tmp = originalValue.split(",")[1];
          if (typeof tmp!=="undefined" && tmp.indexOf('T')!==-1){
            let time = tmp.substr(tmp.indexOf('T'));
            tmp = newValue +time
            if (newValue===""||newValue===null){ // if date is cleared
              tmp = newValue
            }
          }else{
            tmp = newValue
          }
          let fromValue=""
          if (typeof originalValue.split(",")[0]!=="undefined"){
            fromValue = originalValue.split(",")[0]
          }
          let toValue=""
          if(tmp!=null){
            toValue = ","+tmp
          }
          this.fieldValue = fromValue+toValue
        }
      }
    },

    timepickerValueTo: {
      get() {
        if (this.fromTo){
          if (this.fieldValue == null) {
            return null
          }

          let tmp = this.fieldValue.split(",")
          if (tmp[1] == null || tmp[1].length ===10) {
            return null
          }
          return tmp[1].slice(tmp[1].indexOf('T') + 1, tmp[1].indexOf('Z') - 3)
        }
      },
      set(newValue) {
         let originalValue = ""
          let tmp = this.fieldValue.split(",")
          originalValue = tmp[1]

        if (newValue.length===0){
          this.fieldValue = tmp[0]+","+originalValue.substring(0,10)
        }
        if(newValue.length !== 5 || (newValue!==8 && this.field.seconds)){
          return
        }

        if (this.fieldValue != null) {
          let nv =""
          if (originalValue.indexOf('T')!==-1){ // needed for GO, but not for quickfilter
            let date = originalValue.substr(0, originalValue.indexOf('T') + 1);
            let second = (!this.field.seconds) ? ":00Z" : ":Z";
            nv = date + newValue + second
          }else{
            nv = originalValue+"T"+newValue+":00Z"
          }

          this.fieldValue = tmp[0]+","+nv
        }
      }
    },








  }
}
</script>

<template>
  <v-layout v-show="!isHidden()" >

      <v-row>
        <v-col :md="isType(FieldType.DateTime)&&!fromTo?6:12">

      <v-menu v-if="isType(FieldType.Date) ||isType(FieldType.DateTime)"
              :close-on-content-click="false"
              :nudge-right="40"
              v-model="displayMenuFrom"
              transition="scale-transition"
              offset-y
              min-width="290px"
      >
        <template v-slot:activator="{ on }">
          <v-text-field
              :disabled="isReadOnly()"
              v-model="datepickerValueFrom"
              :label="getFilterDateLabel('DateFrom')"
              :placeholder="getFilterDateLabel('DateFrom')"
              prepend-icon="mdi-calendar"
              readonly
              :rules="rules"
              v-on="on"
              :dense="dense"
              :clearable="fromTo||clearable"
              :filled="filled"
          ></v-text-field>
        </template>

        <v-date-picker :max="maxFrom" v-model="datepickerValueFrom" @input="displayMenuFrom = false"></v-date-picker>
      </v-menu>

        </v-col>
        <v-col v-if="isType(FieldType.DateTime)  &&  !fromTo" md="6">

    <!-- Time, DateTime -->
    <v-tooltip bottom>
      <template v-slot:activator="{ on }">
        <div style="display:inline" v-on="isType(FieldType.DateTime)&&datepickerValueFrom==null?on:null">
          <v-text-field v-if="isType(FieldType.Time) ||isType(FieldType.DateTime)"
                        v-model="timepickerValueFrom"
                        :placeholder="getFilterDateLabel('TimeFrom')"
                        prepend-icon="mdi-clock-outline"
                        return-masked-value
                        :disabled="isReadOnly()||isType(FieldType.DateTime)&&datepickerValueFrom==null"
                        :rules="rules"
                        :dense="dense"
                        :filled="filled"
                        v-mask="field.seconds?'##:##:##':'##:##'"
                        masked="true"
          >
          </v-text-field>
        </div>
      </template>
      <span>{{$t('COMMON.SelectDateFirst')}}</span>
    </v-tooltip>
        </v-col>
      </v-row>


    <v-row  v-if="fromTo" no-gutters>
      <v-col :md="isType(FieldType.DateTime)&&!fromTo?6:12">

      <v-menu v-if="isType(FieldType.Date) ||isType(FieldType.DateTime)"
              :close-on-content-click="false"
              :nudge-right="40"
              v-model="displayMenuTo"
              transition="scale-transition"
              offset-y
              min-width="290px"
      >
        <template v-slot:activator="{ on }">
          <v-text-field
              :disabled="isReadOnly()"
              v-model="datepickerValueTo"
              :placeholder="getFilterDateLabel('DateTo')"
              prepend-icon="mdi-calendar"
              readonly
              :rules="rules"
              v-on="on"
              :dense="dense"
              :filled="filled"
              :clearable="fromTo||clearable"
          ></v-text-field>
        </template>

        <v-date-picker :min="minTo" v-model="datepickerValueTo" @input="displayMenuTo = false"></v-date-picker>
      </v-menu>
      </v-col>
      <v-col v-if="isType(FieldType.DateTime) && !fromTo" md="6">

    <!-- Time, DateTime -->
    <v-tooltip bottom>
      <template v-slot:activator="{ on }">
        <div style="display:inline" v-on="isType(FieldType.DateTime)&&datepickerValueTo==null?on:null">
          <v-text-field v-if="isType(FieldType.Time) ||isType(FieldType.DateTime)"
                        v-model="timepickerValueTo"
                        :placeholder="getFilterDateLabel('TimeTo')"
                        prepend-icon="mdi-clock-outline"
                        return-masked-value
                        :disabled="isReadOnly()||isType(FieldType.DateTime)&&datepickerValueTo==null"
                        :rules="rules"
                        :dense="dense"
                        :filled="filled"
                        v-mask="field.seconds?'##:##:##':'##:##'"
                        masked="true"
          >
          </v-text-field>
        </div>
      </template>
      <span>{{$t('COMMON.SelectDateFirst')}}</span>
    </v-tooltip>
      </v-col>
    </v-row>
  </v-layout>
</template>
