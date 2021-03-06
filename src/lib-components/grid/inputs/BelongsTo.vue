<script>
import {VAutocomplete, VCombobox, VListItem, VListItemContent, VSelect} from 'vuetify/lib'
import InputBase from '@/lib-components/grid/inputs/Base'
import {validation} from '@/lib-components/grid/mixins/validation'
import {store} from '@/lib-components/store'
import {SELECT} from "@/lib-components/store/modules/types";
import {http} from '@/lib-components/services/http'


export default {
  components: {VCombobox, VAutocomplete, VListItem, VListItemContent, VSelect},
  extends: InputBase,
  mixins: [validation],
  props: ["api", "parent"],
  data() {
    return {
      selectVal: [],
      selectLoading: false,
      search: null,
      _timerId: null,
      countryID: null,
    }
  },
  watch: {
    search(val) {
      val && val !== this.select && this.fetchEntriesDebounced(this.field.name)
    }
  },
  created: function () {
    this.getSelectValue(this.field.name) // need to be the Struct Name!!!!
  },
  computed: {
    fieldValue2: {
      get() {
        if (typeof this.value === "string") {
          let obj = {};
          for (let head in this.field.fields) {
            if (this.field.fields.hasOwnProperty(head)) {
              obj[this.field.fields[head].name] = null
            }
          }
          obj.Custom = true
          obj.Name = this.value
          this.fieldValue2 = obj
        } else {
          /*
          let _this = this;

          if (_.get(this.value, "Email", null) !== null) {
            _.forEach(_this.value.Email, function (v) {
              if (v.Email !== "") {
                if (_this.parent["Email"] === null) {
                  _this.parent["Email"] = "";
                }
                // email does not exist yet
                if (_this.parent["Email"].indexOf(v.Email)===-1) {
                  if (_this.parent["Email"] !== "") {
                    _this.parent["Email"] += ","
                  }
                  _this.parent["Email"] += v.Email;
                }
              }
            });
          }
          */

        }

        return this.value;
      },
      set(newValue) {
        this.$emit('input', newValue);
        if (Array.isArray(newValue)) {
          // needed somehow, computed item was not triggered.
          this.$emit('changes');
        }
      }
    },
    isAutocomplete() {
      return _.get(this.field, "options.autocomplete", false)
    },
    isCombobox() {
      return _.get(this.field, "options.combobox", false)
    },
    returnObject() {
      return _.get(this.field, "options.select.0.ReturnID", false) === false;
    },
    noDataTxt() {
      return _.get(this.field, 'options.no-data', 'Please enter the search value')
    }
  },
  methods: {
    fetchEntriesDebounced(fieldId) {
      // cancel pending call
      clearTimeout(this._timerId)

      // delay new call 500ms
      this._timerId = setTimeout(() => {
        this.getAPIData(fieldId)
      }, 500)
    },
    getTextFields(item) {
      let arr = _.split(this.field.options.select[0].TextField, ",")
      let rv = []

      _.forEach(arr, function (value) {
        if (value in item) {
          rv.push(item[value])
        } else {
          rv.push(value)
        }
      });
      return rv.join(" ")
    },
    getSelectValue(field) {
      // select object does not exist.
      if (_.get(this.field, "options.select.0", false) === false) {
        return
      }

      // user defined his own items.
      if (_.get(this.field, "options.select.0.Items", false) !== false) {
        this.selectVal = this.field.options.select[0].Items;
        console.log("aaaaa",this.selectVal);
        return
      }

      // load all items of the relation
      //this.loading = true;
      if (_.get(this.parent, "name", false) !== false && field.indexOf(".") === -1) {
        field = this.parent.name + "." + field;
      }

      //wait while loading
      if (field in store.state.selectValues.loading) {
        setTimeout(this.getSelectValue.bind(this, field), 100);
      } else {
        this.getAPIData(field)
      }

    },
    getAPIData(field) {
      this.selectLoading = true;
      // cached values
      if (field in store.state.selectValues.cache && !this.isCombobox && !this.isAutocomplete) {
        this.selectVal = store.state.selectValues.cache[field]
        this.selectLoading = false;
        return
      }

      // set loading
      store.commit("selectValues/" + SELECT.SET_LOADING, field);

      let autocomplete = ""
      if (this.isAutocomplete === true || this.isCombobox) {
        autocomplete = "/q/" + this.search
        if (this.search === null || this.search === "") {
          this.selectLoading = false;
          return
        }
      }

      // load all struct data (needed for combobox manipulation)
      let allParam = ""
      if (_.get(this.field, "options.allFields", false) !== false) {
        allParam = "/allFields/1"
      }

      // request data
      http.get(_.get(this.field, "options.select.api", this.api.replace("mode/update/", "mode/callback/").replace("mode/create", "mode/callback")) + "/callback/select/f/" + field + autocomplete + allParam).then((resp) => {
        if (resp.data.data !== null) {
          this.selectVal = resp.data.data;
        } else {
          this.selectVal = []
        }
        // unset loading + set data
        store.commit("selectValues/" + SELECT.SET_DATA, {'field': field, 'data': resp.data.data});
        store.commit("selectValues/" + SELECT.UNSET_LOADING, field);
        this.selectLoading = false;
      }).catch((err) => {
        // unset loading + unset data
        store.commit("selectValues/" + SELECT.UNSET_LOADING, field);
        store.commit("selectValues/" + SELECT.UNSET_DATA, field);
        this.selectLoading = false;
      });
    }
  }
}
</script>

<template>

  <v-combobox
      v-if="isCombobox"
      :disabled="isReadOnly()"
      v-show="!isHidden()"
      :label="getLabel()"
      :hint="field.description"
      :items="selectVal"
      :no-data-text="noDataTxt"

      :search-input.sync="search"

      :item-value="field.options.select[0].ValueField"
      :item-text="getTextFields"
      :loading="selectLoading"
      persistent-hint
      :multiple="false"
      v-model="fieldValue2"
      :rules=rules

      :dense="dense"
      :filled="filled"
      :outlined="outlined"

  >

    <template v-slot:no-data>
      <v-list-item v-if="!selectLoading&&search!==null">
        <v-list-item-content>
          <v-list-item-title>
            No results matching "<strong>{{ search }}</strong>". Press <kbd>enter</kbd> to create a new one
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </template>

  </v-combobox>

  <v-autocomplete
      v-else-if="isAutocomplete"
      :disabled="isReadOnly()"
      v-show="!isHidden()"
      :label="getLabel()"
      :hint="field.description"
      :items="selectVal"
      :no-data-text="noDataTxt"

      :search-input.sync="search"

      :item-value="field.options.select.ValueField"
      :item-text="getTextFields"
      :loading="selectLoading"

      v-model="fieldValue"
      :rules=rules
      :dense="dense"
      :filled="filled"
      :outlined="outlined"
  ></v-autocomplete>

  <v-select
      v-else
      :clearable="!isRequired()"
      :disabled="isReadOnly()"
      v-show="!isHidden()"
      :label="getLabel()"
      :items="selectVal"
      :hint="field.description"

      :item-value="field.options.select[0].ValueField"
      :item-text="getTextFields"
      :loading="selectLoading"

      :multiple="isType(FieldType.ManyToMany)"
      :chips="isType(FieldType.ManyToMany)"

      v-model="fieldValue"
      :rules=rules
      :dense="dense"
      :filled="filled"
      :return-object="returnObject"
      :outlined="outlined"
  >
  </v-select>

</template>

