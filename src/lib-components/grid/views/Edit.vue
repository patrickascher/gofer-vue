<script>

import {VAlert, VBtn, VCol, VDialog, VForm, VIcon, VRow, VSkeletonLoader, VSpacer, VTooltip} from 'vuetify/lib'
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
import {FieldComponent, MODE_CREATE, MODE_TABLE, MODE_UPDATE} from '@/lib-components/grid/common'
import {isEqual} from 'lodash';
import {store} from '@/lib-components/store'
import {ALERT, SELECT} from '@/lib-components/store/modules/types'
import {viewOptions} from '@/lib-components/grid/mixins/helper'
import History from "@/lib-components/grid/views/EditHistory"

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
    History,
    VDialog,
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
    VIcon,
    VRow, VCol, VSpacer,
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

      showHistory: false,

      config: {title: ""},
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
    historyAllowed:function() {
      return !_.get(this.config, 'history.disable', false) && !_.get(this.config, 'history.hide', false)
    },
    redirect:function(){
      return !_.get(this.config, 'action.disableRedirect', false)
    },
    mode: function () {
      if (typeof this.currentRoute.params === "undefined" || typeof this.currentRoute.params.pathMatch === "undefined") {
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
    checkChanges() {
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
        // default value will be displayed if set on creation mode.
        if (_.get(entry, 'defaultValue', false)!==false){
          item[entry.name]=entry.defaultValue
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

        // if no head was loaded by backend
        if (typeof resp.data.head == "undefined") {
          // TODO show some error message?
          return
        }

        this.head = resp.data.head;
        this.config = resp.data.config;


        if (this.mode === MODE_CREATE) {
          this.item = this.buildItemFromHeader(this.head);
        } else {
          this.item = resp.data.data;
          //manipulation if a relation has a belongsTo field with Multiselect
          this.head.forEach((head) => {
            if (head.type === "hasMany") {
              head.fields.forEach((field) => {
                if(field.type==="MultiSelect"){
                  this.item[head.name].forEach((data,i)=>{
                    this.item[head.name][i][field.name] =  this.item[head.name][i][field.name].split(",")
                  })
                }
              })
            }
          })
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
        method: this.mode === MODE_CREATE ? "post" : "put",
        data: this.item
      }).then((resp) => {
        this.loading = false;
        store.commit('alert/' + ALERT.SUCCESS, this.$t('GRID.ItemSaved'));

        if(this.redirect){
          this.backToGrid()
        }else{
          this.getData() // load fresh data
        }


      }).catch((error) => {
        this.loading = false;
        store.commit('alert/' + ALERT.ERROR, error);
      });
    }
  },
}
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

      <v-row>
        <v-col cols="2">
          <h1>{{ $t(config.title) }}</h1>
        </v-col>
        <v-spacer cols="auto"></v-spacer>
        <v-col cols="2" class="d-flex justify-end">
          <v-dialog v-if="historyAllowed&&mode === 'update'"
                    v-model="showHistory"
                    persistent
                    fullscreen
                    hide-overlay
                    transition="dialog-bottom-transition">
            <template v-slot:activator="{ on, attrs }">

              <v-btn v-on="on" small color="primary">
                <v-icon small>mdi-history</v-icon>
              </v-btn>
            </template>
            <history  :api="api" :config="config" v-model="showHistory"></history>
          </v-dialog>
        </v-col>
      </v-row>

      <!-- Form Data -->
      <v-form ref="form" class="mb-5" v-if="!itemNotFound" v-model="valid">

        <slot :getFieldComponent=getFieldComponent :viewOptions=viewOptions :checkChanges=checkChanges :snapshot="snapshotItem" :item=item :headers="headersNotHidden" name="EditContent">


        <!-- This is just a placeholder for a flowing layout. must be configurable at some point. -->
      <v-row v-if="1==2">
              <v-col v-show="!field.hidden" v-for="(field) in headersNotHidden" :key="field.position+field.name">
                <component @changes="checkChanges" :api="api" :snapshot="snapshotItem" :options="viewOptions(field)"
                           v-model="item[field.name]"
                           :field="field"
                           :is="getFieldComponent(field)"></component>
                </v-col>
      </v-row>

        <v-row v-else v-show="!field.hidden" v-for="(field) in headersNotHidden" :key="field.position+field.name">
          <v-col>
            <component @changes="checkChanges" :api="api" :snapshot="snapshotItem" :options="viewOptions(field)"
                       v-model="item[field.name]"
                       :field="field"
                       :is="getFieldComponent(field)"></component>
          </v-col>
        </v-row>
        </slot>

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
