<script>

import {store} from '@/lib-components/store'
import {http} from '@/lib-components/services/http'

import {ALERT, USER} from '@/lib-components/store/modules/types'
import {isEqual} from "lodash";
import draggable from 'vuedraggable'
import {VCard,
  VCardText,
  VContainer,
  VForm,
  VRow,
  VCol,
  VTextField,
  VAppBar,
  VBtn,
  VIcon,
  VToolbar,
  VToolbarTitle,
  VSpacer,
  VSelect,
  VTooltip,
  VFlex,
  VSimpleTable,
  VSwitch,
  VToolbarItems,
  VCombobox,
  VMenu,
  VDatePicker,
  VSubheader,
  VListItem,
  VListItemContent,
  VListItemTitle,
  VChip,
  VChipGroup

} from 'vuetify/lib'

export default {
  components: {
    draggable,
    VCard,
    VCardText,
    VContainer,
    VForm,
    VRow,
    VCol,
    VTextField,
    VAppBar,
    VBtn,
    VIcon,
    VToolbar,
    VToolbarTitle,
    VSpacer,
    VSelect,
    VTooltip,
    VFlex,
    VSimpleTable,
    VSwitch,
    VToolbarItems,
    VCombobox,
    VMenu,
    VDatePicker,
    VSubheader,
    VListItem,
    VListItemContent,
    VListItemTitle,
    VChip,
    VChipGroup
  },
  props: {
    gridId: String,
    value: Boolean,
    api: String,
    filterList: Array,
    filterActive: Number,
    itemsPerPage: Array,
    showMenu: Boolean
  },
  watch: {
    value: function (val) {
      // loading activated filter
      this.loadSelectedFilter(val)
    }
  },
  methods: {
// loads the filter head data
    getData() {
      this.loading = true;
      http.get(this.api + "/mode/filter").then((resp) => {
        this.headers = resp.data.head;
        this.resetItem();
        this.loadSelectedFilter(true)
        this.loading = false;
      }).catch((err) => {
        this.loading = false;
      });
    },
    // reset all fields
    resetItem() {
      this.snapshot = {};
      this.selectedFilter = null;
      this.$refs.form.resetValidation();
      this.item = {
        Name: "",
        GroupBy: null,
        RowsPerPage: null,
        Sorting: [],
        Filters: [],
        Fields: [],
      }
      this.setFieldsValue()
    },
    // load selected filter
    loadSelectedFilter(val) {
      if (val === true && this.selectedFilter !== this.filterActive && typeof this.filterActive !== "undefined") {
        this.selectedFilter = this.filterActive;
        this.getFilter(this.selectedFilter);
      }
    },

    saveFilter() {
      this.loading = true;
      this.item.GridID = this.gridId

      let sendItem = JSON.parse(JSON.stringify(this.item));
      _.forEach(sendItem.Filters, function (value, index) {
        if (value.Value !== null && typeof value.Value === "object") {
          sendItem.Filters[index].Value = value.Value.join(";")
        }
      });
      _.forEach(sendItem.Fields, function (value, index) {
        delete sendItem.Fields[index].Title;
          sendItem.Fields[index].Pos = sendItem.Fields[index].Pos+1
      });


      http.request({
        url: this.api + "/mode/filter",
        method: (typeof this.selectedFilter === "undefined" || this.selectedFilter === null) ? "post" : "put",
        data: sendItem
      }).then((resp) => {
        this.loading = false;
        store.commit('alert/' + ALERT.SUCCESS, this.$t('GRID.Filter.Saved'));
        this.updateFilterList = resp.data.filterList
        this.close();
      }).catch((e) => {
        this.loading = false;
        store.commit('alert/' + ALERT.ERROR, e);
      });
    },








    validate() {
      if (this.$refs.form.validate()) {
        this.saveFilter()
      }
    },
    closeClick() {
      if (this.changed && this.valid) {
        if (confirm(this.$t('GRID.Filter.UnsavedChanges'))) {
          this.close();
        }
      } else {
        this.close();
      }
    },
    close() {
      this.show = false;
      this.resetItem()
    },
    setFieldsValue() {
      let _this = this

      // add all header fields
      if (this.item.Fields === null || this.item.Fields.length === 0) {
        // Add all fields to the available field list
        _this.availableFields = []
        _this.item.Fields = []
        this.headersNotHidden.forEach(function (value, index) {
          _this.availableFields.push({"Key": value.name,"Title":value.title, "Pos": index})
        });
      } else {
        _this.availableFields = []
        // add all header fields to a temp array to check if the fields are still ok.
        let newFields = []
        for (let head of this.headersNotHidden) {
          newFields.push(head.name);
        }

        let i = 0
        _this.item.Fields.forEach(function (value, index) {
          let exist = false
          _.forEach(newFields, function (headvalue, headindex) {
            if (headvalue === value.Key) {
              exist = true
              newFields.splice(headindex, 1);
            }
          });
          // delete field if its not existing anymore or if its allowed
          if (exist === false) {
            _this.item.Fields.splice(index, 1)
          }
          i++
        });

        newFields.forEach(function (value) {
          _this.availableFields.push({"Key": value, "Pos": i++})
        });
      }
    },
    deleteFilter(id) {
      if (confirm(this.$t('GRID.Filter.Delete'))) {
        // filter selection got cleared
        if (typeof id === "undefined") {
          this.resetItem()
          return
        }
        this.loading = true;
        http.delete(this.api + "/mode/filter/id/" + id).then((resp) => {
          this.loading = false;
          this.updateFilterList = resp.data.filterList
          store.commit('alert/' + ALERT.SUCCESS, this.$t('GRID.Filter.Deleted'));
          this.close();
        });
      }
    },
    getFilter(id) {
      // filter selection got cleared
      if (typeof id === "undefined" || id === null) {
        this.resetItem()
        return
      }
      this.loading = true;
      http.get(this.api + "/mode/filter/id/" + id).then((resp) => {
        this.item = resp.data.item
        if (this.item.Filters === null) {
          this.item.Filters = []
        } else {
          let _this = this
          _.forEach(this.item.Filters, function (value, index) {
            if (value.Op === "IN" || value.Op === "NOTIN") {
              _this.item.Filters[index].Value = value.Value.split(";")
            }
          });
        }
        if (this.item.Sorting === null) {
          this.item.Sorting = []
        }
        this.setFieldsValue()

        this.snapshot = JSON.parse(JSON.stringify(this.item));
        this.loading = false;
      });
    },
    addSortEntry: function () {
      let obj = {Key: null, Pos: null, Desc: null};
      this.item.Sorting.push(obj)
    },
    deleteSortEntry: function (index) {
      this.item.Sorting.splice(index, 1);
    },
    addFilterEntry: function () {
      let obj = {Key: null, Op: null, Value: null};
      this.item.Filters.push(obj)
    },
    deleteFilterEntry: function (index) {
      this.item.Filters.splice(index, 1);
    },
    getFields: function (mode, index) {
      return this.headers.filter(head => {
        if (_.get(head, "remove", false)) {
          return false
        }
        if (_.get(head, mode, false) === false) {
          return false
        }
        if (mode === "sortable" || mode === "filterable") {
          let _items = null
          if (mode === "sortable") {
            _items = this.item.Sorting
          }
          if (mode === "filterable") {
            _items = this.item.Filters
          }
          let exist = false
          _.forEach(_items, function (entry) {
            if (entry.Key === head.name && _items[index].Key !== entry.Key) {
              exist = true
            }
          });
          if (exist) {
            return false
          }
        }
        return true
      })
    },
    addField: function (index) {
      this.item.Fields.push(this.availableFields[index])
      this.availableFields.splice(index, 1)
    },
    deleteField: function (index) {
      this.availableFields.push(this.item.Fields[index])
      this.item.Fields.splice(index, 1)
    },
    calcPosition: function () {
      let _this = this
      _.forEach(_this.item.Fields, function (field, index) {
        field.Pos = index + 1 //avoid 0 because of required tag and go validation logic
      });
      _.forEach(_this.item.Sorting, function (field, index) {
        field.Pos = index + 1 //avoid 0 because of required tag and go validation logic
      });
    },
    disableValueField(field) {
      let op = ["TODAY", "YESTERDAY", "WEEK", "LWEEK", "MONTH", "LMONTH", "YEAR", "LYEAR", "NULL", "NOTNULL"];
      if (op.indexOf(field.Op) !== -1) {
        field.Value = null;
        return true
      }
      return false
    },
    operatorByType(el) {
      if (this.isDateField(el)) {
        return [{value: 'TODAY', text: this.$t('GRID.Filter.Today')},
          {value: 'YESTERDAY', text: this.$t('GRID.Filter.Yesterday')},
          {value: 'WEEK', text: this.$t('GRID.Filter.ThisWeek')},
          {value: 'LWEEK', text: this.$t('GRID.Filter.LastWeek')},
          {value: 'MONTH', text: this.$t('GRID.Filter.ThisMonth')},
          {value: 'LMONTH', text: this.$t('GRID.Filter.LastMonth')},
          {value: 'YEAR', text: this.$t('GRID.Filter.ThisYear')},
          {value: 'LYEAR', text: this.$t('GRID.Filter.LastYear')},
          {value: '=', text: this.$t('GRID.Filter.Equal')},
          {value: '!=', text: this.$t('GRID.Filter.NotEqual')},
          {value: '>=', text: this.$t('GRID.Filter.GreaterThan')},
          {value: '<=', text: this.$t('GRID.Filter.LesserThan')},
          {value: 'NULL', text: this.$t('GRID.Filter.Null')},
          {value: 'NOTNULL', text: this.$t('GRID.Filter.NotNull')},
        ]
      }
      return [
        {value: '=', text: this.$t('GRID.Filter.Equal')},
        {value: '!=', text: this.$t('GRID.Filter.NotEqual')},
        {value: '>=', text: this.$t('GRID.Filter.GreaterThan')},
        {value: '<=', text: this.$t('GRID.Filter.LesserThan')},
        {value: 'IN', text: this.$t('GRID.Filter.In')},
        {value: 'NOTIN', text: this.$t('GRID.Filter.NotIn')},
        {value: 'LIKE', text: this.$t('GRID.Filter.Like')},
        {value: 'RLIKE', text: this.$t('GRID.Filter.RLike')},
        {value: 'LLIKE', text: this.$t('GRID.Filter.LLike')},
        {value: 'NULL', text: this.$t('GRID.Filter.Null')},
        {value: 'NOTNULL', text: this.$t('GRID.Filter.NotNull')}]
    },
    isDateField(el) {
      let date = false;
      _.forEach(this.headers, function (value) {
        if (_.get(value, "filterable", false) !== false && value.name === el.Key && value.type === "DATE") {
          date = true;
        }
      });
      return date;
    },
  },
  created() {
    this.getData()
  },
  computed: {
    filterAllowed() {
      let filter = false;
      _.forEach(this.headers, function (value) {
        if (_.get(value, "filterable", false) !== false) {
          filter = true;
        }
      });
      return filter;
    },
    sortAllowed() {
      let filter = false;
      _.forEach(this.headers, function (value) {
        if (_.get(value, "sortable", false) !== false) {
          filter = true;
        }
      });
      return filter;
    },
    groupAllowed() {
      let filter = false;
      _.forEach(this.headers, function (value) {
        if (_.get(value, "groupable", false) !== false) {
          filter = true;
        }
      });
      return filter;
    },
    headersNotHidden() {
      return this.headers.filter(head => {
        if (_.get(head, "remove", false)) {
          return false
        }
        return typeof head.hide === 'undefined';
      })
    },
    show: {
      get() {
        return this.value
      },
      set(value) {
        this.$emit('input', value)
      }
    },
    updateFilterList: {
      get() {
        return this.filterList
      },
      set(value) {
        this.$emit('updatefilterlist', value)
      }
    },
    changed: function () {
      return !isEqual(this.item, this.snapshot)
    },
  },
  data() {
    return {
      selectedFilter: null,
      headers: [],
      apiLink: '',
      valid: false,
      loading: false,
      snapshot: {},
      tmpMenu: {},
      item: {
        Name: "",
        GroupBy: null,
        RowsPerPage: null,
        Sorting: [],
        Filters: [],
        Fields: [],
      },
      availableFields: []
    }
  }
}
</script>

<template>
  <v-card>

    <v-app-bar
        fixed
        dark
        color="primary"
    >
      <v-btn
          icon
          dark
          @click.stop="closeClick"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>
      <v-toolbar-title>{{ $t('GRID.Filter.Title') }}</v-toolbar-title>

      <v-spacer></v-spacer>

      <v-toolbar-items>
        <v-select class="mt-3" :items="this.filterList"
                  item-text="name"
                  item-value="id"
                  :label="$t('GRID.Filter.Edit')"
                  v-model="selectedFilter"
                  :loading="loading"
                  :no-data-text="$t('COMMON.NoData')"
                  @change="getFilter(selectedFilter)"
                  clearable></v-select>
      </v-toolbar-items>

      <v-toolbar-items v-if="selectedFilter">
        <v-btn
            class="mx-4"
            icon
            dark
            @click="deleteFilter(selectedFilter)"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </v-toolbar-items>

      <v-tooltip>
        <template v-slot:activator="{ on }">
          <v-toolbar-items v-on="!changed || loading || !valid?on:null">
            <v-btn
                class="mx-0"
                :loading="loading"
                dark
                icon
                :disabled="!changed || loading || !valid"
                @click="validate()"
            >
              <v-icon>mdi-content-save</v-icon>
            </v-btn>
          </v-toolbar-items>
        </template>
        <span v-if="!changed">{{ $t('COMMON.NoChanges') }}</span>
        <span v-if="!valid">{{ $t('COMMON.NotValid') }}</span>
      </v-tooltip>

    </v-app-bar>


    <v-card-text class="mt-12">
      <v-container>
        <v-form ref="form" v-model="valid">
          <v-row>
            <v-col>
              <v-text-field :rules="[v => !!v || $t('COMMON.Required')]"
                            required
                            v-model="item.Name"
                            :label="$t('GRID.Filter.Name')+' *'" required></v-text-field>
            </v-col>
            <v-col v-if="groupAllowed">
              <v-select :items="getFields('groupable')"
                        item-value="name"
                        :item-text="item => $t(item.title)"
                        :label="$t('GRID.Filter.Group')"
                        clearable
                        v-model="item.GroupBy"></v-select>
            </v-col>
            <v-col>
              <v-select :items="itemsPerPage"
                        clearable
                        :label="$t('GRID.RowsPerPage')"
                        v-model="item.RowsPerPage"></v-select>
            </v-col>
          </v-row>


          <v-row v-if="sortAllowed" style="margin-bottom: 10px;">
            <v-flex>
              <v-toolbar class="elevation-1" color="white">
                <v-toolbar-title>{{ $t('GRID.Filter.Sort') }}:</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn icon @click="addSortEntry()">
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
              </v-toolbar>

              <v-simple-table class="elevation-1">
                <template v-slot:default>
                  <draggable v-model="item.Sorting" handle=".handle" tag="tbody"
                             @change="calcPosition">
                    <tr v-for="(f,index) in item.Sorting" :key="f.Key">
                      <td width="5">
                        <v-icon class="handle">mdi-drag-horizontal-variant</v-icon>
                      </td>
                      <td>
                        <v-select :items="getFields('sortable',index)"
                                  item-value="name"
                                  :item-text="item => $t(item.title)"
                                  label="Field"
                                  :rules="[v => !!v || $t('COMMON.Required')]"
                                  required
                                  v-model="item.Sorting[index].Key"></v-select>
                      </td>
                      <td>
                        <v-switch
                            :label="$t('GRID.Filter.DESC')"
                            v-model.lazy="item.Sorting[index].Desc"
                        >
                        </v-switch>
                        <v-text-field style="display:none" :value="index"
                                      v-model.lazy="item.Sorting[index].Pos"></v-text-field>
                      </td>
                      <td style="width:20px;">
                        <v-icon
                            @click="deleteSortEntry(index)"
                            small
                        >
                          mdi-delete
                        </v-icon>
                      </td>
                    </tr>
                  </draggable>
                </template>
              </v-simple-table>
            </v-flex>
          </v-row>

          <v-row v-if="filterAllowed" class="mb-2">
            <v-flex>
              <v-toolbar class="elevation-1" color="white">
                <v-toolbar-title>{{ $t('GRID.Filter.Title') }}:</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn icon @click="addFilterEntry()">
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
              </v-toolbar>


              <v-simple-table class="elevation-1">
                <template v-slot:default>
                  <tbody>
                  <tr v-for="(f,index) in item.Filters" :key="f.Key">
                    <td>
                      <v-select :items="getFields('filterable',index)"
                                item-value="name"
                                :item-text="item => $t(item.title)"
                                label="Field"
                                :rules="[v => !!v || $t('COMMON.Required')]"
                                required
                                @change="item.Filters[index].Op=null;item.Filters[index].Value=null"
                                v-model="item.Filters[index].Key"></v-select>
                    </td>
                    <td>
                      <v-select :items="operatorByType(item.Filters[index])"
                                label="Operator"
                                :rules="[v => !!v || $t('COMMON.Required')]"
                                required
                                persistent-hint
                                :disabled="item.Filters[index].Key===null"
                                @change="item.Filters[index].Value=null"
                                v-model="item.Filters[index].Op"></v-select>
                    </td>
                    <td>
                      <template v-if="!disableValueField(item.Filters[index])">
                        <v-text-field
                            v-if="!isDateField(item.Filters[index]) && item.Filters[index].Op!=='IN' && item.Filters[index].Op!=='NOTIN'"
                            label="Value"
                            :rules="[v => !!v || $t('COMMON.Required')]"
                            required
                            :disabled="item.Filters[index].Op===null"
                            v-model="item.Filters[index].Value"></v-text-field>
                        <v-combobox
                            v-else-if="item.Filters[index].Op==='IN' || item.Filters[index].Op==='NOTIN'"
                            v-model="item.Filters[index].Value"
                            :disabled="item.Filters[index].Op===null"
                            :rules="[v => !!v || $t('COMMON.Required')]"
                            hide-no-data
                            :items="[]"
                            label="Value"
                            multiple
                            small-chips
                            deletable-chips
                        >
                        </v-combobox>

                        <v-menu v-else
                                :disabled="item.Filters[index].Op===null"
                                :close-on-content-click="false"
                                :nudge-right="40"
                                v-model="tmpMenu[index]"
                                transition="scale-transition"
                                offset-y
                                min-width="290px"
                        >
                          <template v-slot:activator="{ on }">
                            <v-text-field
                                :disabled="item.Filters[index].Op===null"
                                v-model="item.Filters[index].Value"
                                label="Value"
                                :rules="[v => !!v || $t('COMMON.Required')]"
                                prepend-icon="mdi-calendar"
                                readonly
                                v-on="on"
                            ></v-text-field>
                          </template>
                          <v-date-picker v-model="item.Filters[index].Value"
                                         @input="tmpMenu[index] = false"></v-date-picker>
                        </v-menu>
                      </template>
                    </td>
                    <td style="width:20px;">
                      <v-icon
                          @click="deleteFilterEntry(index)"
                          small
                      >
                        mdi-delete
                      </v-icon>
                    </td>
                  </tr>
                  </tbody>
                </template>
              </v-simple-table>
            </v-flex>
          </v-row>


          <v-row>
            <v-flex>
              <v-toolbar class="elevation-1" color="white">
                <v-toolbar-title>{{ $t('GRID.Filter.Fields') }}:</v-toolbar-title>
              </v-toolbar>
              <v-row
                  no-gutters
                  style="flex-wrap: nowrap;"
              >
                <v-col>
                  <v-card tile md6>
                    <v-subheader>
                      {{$t('GRID.Filter.CustomFields')}}
                    </v-subheader>
                    <draggable
                        style="min-height: 10px"
                        v-model="item.Fields"
                        @change="calcPosition"
                        :options="{group:'fields', ghostClass: 'ghost'}"
                        @start="isDragging = true"
                        @end="isDragging = false">
                      <transition-group type="transition" name="flip-list">

                        <v-list-item style="border-bottom: 1px #ccc solid;min-height: 10px" :key="item.Key" dense
                                     v-for="(item,index) in item.Fields">
                          <v-list-item-content>
                            <v-list-item-title class="d-flex flex-row ">
                              <v-chip small class="d-flex-column">{{ $t(item.Title) }}</v-chip>
                              <v-spacer/>
                              <v-icon class="d-flex-column justify-end " small @click="deleteField(index)">mdi-delete
                              </v-icon>
                            </v-list-item-title>
                          </v-list-item-content>
                        </v-list-item>
                      </transition-group>
                    </draggable>

                  </v-card>
                </v-col>
                <v-col>
                  <v-card tile xs6>
                    <v-subheader>
                      {{$t('GRID.Filter.AvailableFields')}}
                    </v-subheader>
                    <v-chip-group
                        class="ma-2"
                        active-class="primary--text"
                        column
                    >
                      <v-chip
                          small
                          v-for="(af,index) in availableFields"
                          :key="af.Key"
                          @click="addField(index)"
                      >
                        {{$t(af.Title)}}
                      </v-chip>
                    </v-chip-group>
                  </v-card>
                </v-col>
              </v-row>


            </v-flex>
          </v-row>

        </v-form>
      </v-container>
    </v-card-text>
  </v-card>
</template>


<style>
.flip-list-move {
  transition: transform 0.5s;
}

.no-move {
  transition: transform 0s;
}

.ghost {
  opacity: 0.5;
  background: #1e7d85;
}

.v-list-item:hover {
  background: #eeeeee;
}

</style>
