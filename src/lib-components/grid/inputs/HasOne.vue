<script>
import {VBtn, VDataTable, VFlex, VIcon, VSpacer, VToolbar, VToolbarTitle} from 'vuetify/lib'

import InputIntegerText from '@/lib-components/grid/inputs/IntegerText'
import InputTextArea from '@/lib-components/grid/inputs/TextArea'
import InputDateTime from '@/lib-components/grid/inputs/DateTime'
import InputBelongsTo from '@/lib-components/grid/inputs/BelongsTo'
import InputManyToMany from '@/lib-components/grid/inputs/ManyToMany'
import InputBool from '@/lib-components/grid/inputs/Bool'
import InputBase from '@/lib-components/grid/inputs/Base'
import {validation} from '@/lib-components/grid/mixins/validation'
import {viewOptions} from '@/lib-components/grid/mixins/helper'
import {FieldComponent} from '@/lib-components/grid/common'


export default {
  extends: InputBase,
  mixins: [validation],
  props: ['api', 'options', 'snapshot'],
  components: {
    InputIntegerText,
    InputTextArea,
    InputDateTime,
    InputBelongsTo,
    InputManyToMany,
    InputBool,
    VFlex, VToolbar, VToolbarTitle, VSpacer, VBtn, VIcon, VDataTable
  },
  data() {
    return {
      minOne: false,
      maxFour: false
    }
  },
  mounted() {
    if (this.fieldValue == null) {
      if (this.isType(this.FieldType.HasMany)) {
        this.fieldValue = []
        this.snapshot = []
      } else {
        let obj = {};
        for (let head in this.field.fields) {
          if (Object.prototype.hasOwnProperty.call(this.field.fields, head)) {
            obj[this.field.fields[head].name] = null
          }
        }
        this.fieldValue = obj
      }

    }
    if (_.get(this.options, "validate", "") === "min=1,max=4") {
      this.maxFour = true
    }

    if (_.get(this.options, "validate", "") === "min=1" || _.get(this.options, "validate", "") === "min=1,max=4") {
      if (this.fieldValue.length === 0) {
        this.addTableEntry(this.field.fields)
      }
      this.minOne = true
    }

  },
  computed: {
    addDisbaled() {
      return _.get(this.options, "disable-add", false)
    },
    sortFields() {
      return _.sortBy(this.field.fields, ['position'])
    }
  },
  methods: {
    cssStyle: function(head) {
      let v = _.get(head,"options.width.0",false)
      if(v!==false){
        return "width:"+v+"px;"
      }
      return false
    },
    viewOptions: viewOptions,
    getFieldComponent(field) {
      return FieldComponent(field)
    },
    changedData(key, index) {
      console.log(key, index)
    },
    addTableEntry: function (header) {
      let obj = {};
      for (let head in header) {
        if (Object.prototype.hasOwnProperty.call(header, head)) {
          obj[header[head].name] = null
        }
      }

      if (this.isType(this.FieldType.HasOne)) { // TODO check if needed for hasOne go-ptr maybe?
        this.fieldValue = obj;
      } else {
        if (this.fieldValue == null) {
          this.fieldValue = [obj]
        } else {
          this.fieldValue.push(obj);
        }
      }
    },
    deleteTableEntry: function (index) {
      this.fieldValue.splice(index, 1);
    },
    setTableData: function (value, field, index) {
      if (this.isType(this.FieldType.HasMany)) {
        this.fieldValue[index][field] = value;
      } else {
        this.fieldValue[field] = value;
      }
    },
  }
}
</script>

<template>

  <v-flex v-show="!isHidden()" class="mb-3" v-if="isType(FieldType.HasMany) || isType(FieldType.HasOne)">
    <v-toolbar flat dense class="elevation-1" color="white">
      <v-toolbar-title>{{ getLabel }} {{ field.description }}
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn v-if="!isReadOnly()&&isType(FieldType.HasMany)&&!addDisbaled&&(!this.maxFour||(this.maxFour&&fieldValue.length<4))" icon
             @click="addTableEntry(field.fields)">
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </v-toolbar>

    <v-data-table
        v-if="(isType(FieldType.HasMany) && fieldValue!=null) || isType(FieldType.HasOne)"
        :items="Array.isArray(fieldValue)?fieldValue:[fieldValue]"
        class="elevation-1"
        :no-data-text="$t('GRID.NoData')"
        :loading-text="$t('GRID.LoadingData')"
        hide-default-header
        hide-default-footer
        disable-pagination
    >


      <template v-slot:item="{ item,index }">
        <tr style="vertical-align: top;">

          <td :style="cssStyle(head)" class="start pr-0" v-if="!isReadOnly()&&!head.remove" v-show="!isHidden()" v-for="(head) in sortFields"
              :key="head.name">

            <component :api="api"
                       :field="head"
                       :parent="field"
                       :parentData="fieldValue"
                       :index="index"
                       :is="getFieldComponent(head)"
                       :options="viewOptions(head)"
                       v-on:input="setTableData($event, head.name, index)"
                       v-bind:value="Array.isArray(fieldValue)?fieldValue[index][head.name]:fieldValue!=null?fieldValue[head.name]:null">
            </component>
          </td>
          <td style="width:20px;" v-if="!isReadOnly() && isType(FieldType.HasMany)">
            <v-icon
                class="mt-4"
                v-if="minOne!==true||index!==0"
                @click="deleteTableEntry(index)"
                small
            >
              mdi-delete
            </v-icon>
          </td>

          <!-- READ ONLY -->
          <td v-if="isReadOnly()&&!head.remove" v-show="!isHidden()" v-for="(head) in sortFields" :key="head.name">
            <component v-if="head.view" :api="api"
                       :field="head"
                       :parent="field"
                       :parentData="fieldValue"
                       :index="index"
                       :is="getFieldComponent(head)"
                       :options="viewOptions(head)"
                       v-bind:value="Array.isArray(fieldValue)?fieldValue[index][head.name]:fieldValue!=null?fieldValue[head.name]:null">
            </component>
            <div v-else>
              {{Array.isArray(fieldValue) ? fieldValue[index][head.name] : fieldValue != null ? fieldValue[head.name] : null }}
            </div>
          </td>

        </tr>
      </template>

    </v-data-table>
  </v-flex>

</template>
