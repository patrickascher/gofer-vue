<script>

import {VAlert, VBtn, VForm, VSkeletonLoader, VTooltip} from 'vuetify/lib'
import {http} from '@/lib-components/services/http'

import InputIntegerText from '@/lib-components/grid/inputs/IntegerText'
import InputTextArea from '@/lib-components/grid/inputs/TextArea'
import InputDateTime from '@/lib-components/grid/inputs/DateTime'
import InputBelongsTo from '@/lib-components/grid/inputs/BelongsTo'
import InputManyToMany from '@/lib-components/grid/inputs/ManyToMany'
import InputHasOne from '@/lib-components/grid/inputs/HasOne'
import InputHasMany from '@/lib-components/grid/inputs/HasMany'
import InputBool from '@/lib-components/grid/inputs/Bool'
import InputFile from '@/lib-components/grid/inputs/File'


import {FieldType} from '@/lib-components/grid/inputs/Base'
import {MODE_CREATE, MODE_TABLE, MODE_UPDATE} from '@/lib-components/grid/Grid'
import {isEqual} from 'lodash';
import {store} from '@/lib-components/store'
import {ALERT, SELECT} from '@/lib-components/store/modules/types'
import {viewOptions} from '@/lib-components/grid/mixins/helper'

export default {
  /**
   * properties
   * api - backend API url
   */
  props: {api: String},
  /**
   *  components loads all the default input components.
   */
  components: {
    InputIntegerText,
    InputTextArea,
    InputDateTime,
    InputBelongsTo,
    InputManyToMany,
    InputHasOne,
    InputHasMany,
    InputBool,
    InputFile,
    VForm,
    VAlert,
    VBtn,
    VTooltip,
    VSkeletonLoader
  },
  data() {
    return {
      currentRoute: {},
      valid: false,
      itemNotFound: false,
      loading: false,
      itemChanged: false,

      config: {},
      head: [],
      snapshotItem: {},
      item: {},
    }
  },
  /**
   * mounted is calling getData, to load the edit information from the backend.
   */
  mounted: function () {
    this.currentRoute = this.$router.history.current
    this.getData();
  },
  beforeDestroy() {
    store.commit("selectValues/" + SELECT.UNSET_DATA);
  },
  computed: {
    changed: function () {
      this.itemChanged = !isEqual(this.item, this.snapshotItem)
      return this.itemChanged
    },
    /**
     * changed returns a boolean if the item has changed through the users input.
     * @returns {boolean}
     */
    headersNotHidden() {
      return this.head.filter(head => {
        if (head.value === 'grid_action' && !this.showAction) {
          return false
        }
        if (_.get(head, "remove", false)) {
          return false
        }
        head.title = this.$t(head.tmpTitle)
        return typeof head.hide === 'undefined';
      })
    },
  },
  methods: {
    mode: function () {
      if (typeof this.currentRoute.params.pathMatch === "undefined") {
        return MODE_TABLE
      }

      if (this.currentRoute.params.pathMatch.includes("mode/create")) {
        return MODE_CREATE
      }

      if (this.currentRoute.params.pathMatch.includes("mode/update/")) {
        return MODE_UPDATE
      }

      // fallback
      return MODE_TABLE
    },
    checkchanges() {
      this.itemChanged = !isEqual(this.item, this.snapshotItem)
    },
    viewOptions: viewOptions,
    /**
     * getFieldComponent returns the input field component.
     * A Field can have its custom component. This is defined in the backend.
     * Otherwise a list of default input components is set.
     *
     * @param field
     * @returns {string|*}
     */
    getFieldComponent(field) {
      return FieldComponent(field)
    },
    /**
     * buildItemFromHeader creates a item with the backend header information.
     * This is usually used with an new entry.
     *
     * @param head
     */
    buildItemFromHeader(head) {
      let item = {};
      head.forEach((entry) => {
        if (entry.fieldType === FieldType.Text) {
          item[entry.name] = "" // needed for validations in the backend (example validation:"max=10" triggers an error on an null value)
        } else {
          if (entry.fieldType === FieldType.HasOne) {
            item[entry.name] = this.buildItemFromHeader(entry.fields)
          } else {
            item[entry.name] = null
          }
        }
      });
      return item
    },
    /**
     * validate is calling the save() method if the whole form is valid.
     */
    validate() {
      if (this.$refs.form.validate()) {
        this.save()
      }
    },
    /**
     * getData is requesting the data of the backend api.
     *
     * If everything is ok, the item object and a snapshot from it gets set.
     *
     * If a error happens, a new ALERT.ERROR is getting triggered and the internal error variable is set to true.
     * The internal error variable is used to display an error message to the user.
     */
    getData() {
      this.loading = true;

      http.get(this.api).then((resp) => {

        this.head = resp.data.head;
        this.config = resp.data.config;

        if (this.mode() === MODE_CREATE) {
          this.item = this.buildItemFromHeader(this.head);
        } else {
          this.item = resp.data.data;
        }



        //manipulations for relations and null
        this.head.forEach((head) => {

          head.tmpTitle = head.title // needed for the translation to reg. changes.

          if (head.primary === true) {
            if (this.item == null || this.item[head.name] === 0) {
              this.itemNotFound = true;
            }
          }

          if (head.type === "hasMany" && this.item[head.name] == null) {
            this.item[head.name] = [];
          }

          if (head.type === "m2m" && this.item[head.name] == null) {
            this.item[head.name] = []
          }
        });


        this.snapshotItem = JSON.parse(JSON.stringify(this.item)); // Object.assign({}, this.item); has no deep copy
        this.loading = false;
      }).catch((error) => {
        this.loading = false;
        store.commit('alert/' + ALERT.ERROR, error);

        // TODO this has to be changed if the module backend logic changes again.
        //if (err.response.data.error === "sql: no rows in result set") {
        //    this.itemNotFound = true;
        //}
      });
    },
    /**
     * backToGrid redirects to the parent route.
     */
    backToGrid() {
      this.$router.push(this.$route.matched[this.$route.matched.length - 2].path)
    },
    /**
     * save method creates a post/put request to the backend api.
     *
     * If everything was ok, a ALERT.SUCCESS message will get set.
     * If it was a save of a new Entry, you will get redirected to the edit view with the right params of the new entry.
     * If it was an update, a refresh of the data will get loaded, to ensure that the data was saved correctly.
     *
     * If an error happens, an ALERT.ERROR message will happen.
     */
    save() {
      this.loading = true;
      http.request({
        url: this.api,
        method: this.mode() === MODE_CREATE ? "post" : "put",
        data: this.item
      }).then((resp) => {
        this.loading = false;
        store.commit('alert/' + ALERT.SUCCESS, this.$t('GRID.ItemSaved'));
        this.backToGrid()
      }).catch((error) => {
        this.loading = false;
        store.commit('alert/' + ALERT.ERROR, error);
      });
    }
  },
}

/**
 * @return {string}
 */
export const FieldComponent = function (field) {

  if (typeof field.view !== "undefined") {
    return field.view;
  }

  switch (field.type) {
    case FieldType.File:
      return "input-file"
    case FieldType.Text:
    case FieldType.Password:
    case FieldType.Integer:
    case FieldType.Float:
      return "input-integer-text";
    case FieldType.TextArea:
      return "input-text-area";
    case FieldType.Time:
    case FieldType.Date:
    case FieldType.DateTime:
      return "input-date-time";
    case FieldType.BelongsTo:
    case FieldType.Select:
      return "input-belongs-to";
    case FieldType.ManyToManySR:
    case FieldType.ManyToMany:
      return "input-many-to-many";
    case FieldType.HasOne:
      return "input-has-one";
    case FieldType.HasMany:
      return "input-has-many";
    case FieldType.Bool:
      return "input-bool"
    default:
      console.error("The component \"" + field.type + "\" is not implemented (" + field.name + ")");
      return "";
  }
};
</script>

<template>
  <div>

    <div v-if="loading&&head.length===0">
      <v-skeleton-loader
          width="450"
          class="mt-4"
          type="text"
      ></v-skeleton-loader>
      <h1>{{ $t(config.title) }}</h1>
      <hr color="gray" class="mb-10" style="border-radius:5px;height:6px;width:50px;"/>
      <v-skeleton-loader v-for="i in [1,2,3,4,5,6]"
                         class="mt-4"
                         type="heading"
                         width="1000"
      ></v-skeleton-loader>
      <v-skeleton-loader
          max-width="500"
          class="mt-10"
          max-height="30"
          type="button@2"
      ></v-skeleton-loader>
    </div>

    <div v-else>
      <h1>{{ $t(config.title) }}</h1>

      <!-- Form Data -->
      <v-form ref="form" v-if="!itemNotFound" v-model="valid">
        <div v-for="(field) in headersNotHidden" :key="field.position+field.name">
          <component @changes="checkchanges" :api="api" :snapshot="snapshotItem" :options="viewOptions(field)"
                     v-model="item[field.name]"
                     :field="field"
                     :is="getFieldComponent(field)"></component>
        </div>
      </v-form>


      <!-- Back Button -->
      <v-alert :value="itemNotFound" color="info" icon="warning">
        {{ $t('GRID.NoData') }}
      </v-alert>

      <v-btn
          class="mr-2"
          outlined
          color="primary"
          @click="backToGrid()"
      >
        {{ $t('COMMON.Back') }}
      </v-btn>

      <!-- Save Button -->
      <v-tooltip right>
        <template v-slot:activator="{ on }">
          <div style="display:inline-block" v-on="!changed || loading || !valid?on:null">
            <v-btn
                :loading="loading"
                color="primary"
                @click="validate()"
                :disabled="!changed || loading || !valid"
            >
              {{ $t('COMMON.Save') }}
            </v-btn>
          </div>
        </template>
        <span v-if="!changed">{{ $t('COMMON.NoChanges') }}</span>
        <span v-if="!valid">{{ $t('COMMON.NotValid') }}</span>
      </v-tooltip>
    </div>
  </div>
</template>
