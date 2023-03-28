<script>

import InputIntegerText from '@/lib-components/grid/inputs/IntegerText'
import InputBelongsTo from '@/lib-components/grid/inputs/BelongsTo'
import InputBool from '@/lib-components/grid/inputs/Bool'
import InputHasMany from '@/lib-components/grid/inputs/HasMany'
import InputManyToMany from '@/lib-components/grid/inputs/ManyToMany'

import {FieldComponent} from '@/lib-components/grid/common'
import {viewOptions} from '@/lib-components/grid/mixins/helper'
import {store} from '@/lib-components/store'
import {ALERT, NAVIGATION, USER} from '@/lib-components/store/modules/types'
import {isEqual,get} from "lodash";
import {http} from '@/lib-components/services/http'

import {VCard
  ,VForm
  ,VCol
  ,VRow
  ,VTextField
  ,VDivider
  ,VSubheader
  ,VSkeletonLoader
  ,VToolbar
  ,VToolbarItems
  ,VTooltip
  ,VBtn
  ,VIcon
  ,VToolbarTitle
  ,VSpacer} from 'vuetify/lib'
import {userService} from "@/lib-components/services/user";
import {Config} from "@/lib-components";


export default {

  props: {
    gridId: String,
    value: Boolean,
    api: String,
    filterList: Array,
    filterActive: Number,
    itemsPerPage: Array,
    passwordView: Boolean,
  },
  components: {
    InputIntegerText,
    InputBelongsTo,
    InputBool,
    InputHasMany,
    InputManyToMany,
    VForm
    ,VCol
    ,VRow
    ,VTextField
    ,VDivider
    ,VSubheader
    ,VSkeletonLoader
    ,VToolbar
    ,VToolbarItems
    ,VTooltip
    ,VCard
    ,VBtn
    ,VIcon,
    VToolbarTitle
    ,VSpacer
  },
  mounted() {
    this.user = store.getters['user/' + USER.GET_DATA]
    this.getProfile(true)
  },
  watch: {
    value: function (val) {
      this.getProfile(val)
    }
  },

  methods: {
    pwRules(field, val) {
      // oldpw is exculuded from the rules because we can not be sure if the user was not using a unsafe pw in the past.

      if (field!=="oldpw" && this.item['Password']!=null && this.item['Password'].length<8) {
        return ["Min. 8 characters"]
      }

      if (((this.item['OldPassword'] != null && this.item['OldPassword'] !== "") ||
          (this.item['Password'] != null && this.item['Password'] !== "") ||
          (this.item['RePassword'] != null && this.item['RePassword'] !== "")) && (val === "" || val == null)) {
        return ["Field is mandatory"]
      }

      if (field === "reenter" && (val !== "" && val != null) && (this.item['RePassword'] !== this.item['Password'] || this.item['OldPassword'] === this.item['RePassword'])) {
        return ["Password is not equal or the same as before"]
      }

      // add regex
      if (field!=="oldpw"){
        const regex = /((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W]).{8,32})/;
        if (!regex.test(this.item['Password'])){
          return ["Password is not complex enough. Min. 8 Chars, 1 uppercase, 1 lowercase, 1 number and 1 special character"]
        }
      }

      return [true]
    },
    viewOptions: viewOptions,
    getFieldComponent(field) {
      return FieldComponent(field)
    },
    getProfile(val) {
      if (val === true) {
        this.loading = true;
        http.get(this.api+"/provider/"+this.user.Options.provider).then((resp) => {
          this.item = resp.data.data
          this.head = resp.data.head;
          this.snapshot = JSON.parse(JSON.stringify(this.item));
          this.loading = false;
        });
      }
    },
    saveProfile(pwView) {
      this.loading = true;
      http.request({
        url: this.api +"/provider/"+this.user.Options.provider+(pwView?'/password/1':''),
        method: "put",
        data: this.item
      }).then((resp) => {
        this.loading = false;
        if(pwView){
          store.commit('alert/' + ALERT.SUCCESS, this.$t('COMMON.PasswordSaved'));
        }else{
          store.commit('alert/' + ALERT.SUCCESS, this.$t('COMMON.ProfileSaved'));
          store.commit('navigation/' + NAVIGATION.RELOAD)
        }
        this.show = false;
        this.item.OldPassword=null;
        this.item.Password=null;
        this.item.RePassword=null;

        if (resp.data.claim) {
          // Add token to local storage
          localStorage.setItem(Config.get('webserver.app.name')+'_user',JSON.stringify(resp.data.claim));
          userService.initUser();
        }

      }).catch((error) => {
        this.loading = false;
        store.commit('alert/' + ALERT.ERROR, error);

      });
    },
    validate(pwView) {
      if (this.$refs.form.validate()) {
        this.saveProfile(pwView)
      }
    },
  },
  computed: {
    changed: function () {
      this.itemChanged = !isEqual(this.item, this.snapshot)
      return this.itemChanged
    },
    headersNotHidden() {
      return this.head.filter(head => {

        if (head.value === 'grid_action' && !this.showAction) {
          return false
        }
        if (get(head, "remove", false)) {
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
        this.$emit('closeMenu', false)
        this.$emit('input', value)
      }
    },

  },
  data() {
    return {
      selectedFilter: null,
      headers: [],
      valid: false,
      loading: false,

      head: [],
      snapshot: {},
      itemChanged: false,
      item: {},
      oldPassword: null,

      user:{}
    }
  }
}
</script>

<template>
  <v-card>
    <v-toolbar
        dark
        color="primary"
    >
      <v-btn
          icon
          dark
          @click="show = false"
          :disabled="user.State==='PWCHANGE'"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>
      <v-toolbar-title v-if="!passwordView">Profile</v-toolbar-title>
      <v-toolbar-title v-if="passwordView">Change password</v-toolbar-title>

      <v-spacer></v-spacer>

      <v-tooltip right>


        <template v-slot:activator="{ on }">
          <v-toolbar-items v-on="!changed || loading || !valid?on:null">
            <v-btn
                :loading="loading"
                dark
                text
                :disabled="!changed || loading || !valid"
                @click="validate(passwordView)"
            >
              {{ $t('COMMON.Save') }}
            </v-btn>
          </v-toolbar-items>
        </template>
        <span v-if="!changed">{{ $t('COMMON.NoChanges') }}</span>
        <span v-if="!valid">{{ $t('COMMON.NotValid') }}</span>
      </v-tooltip>

    </v-toolbar>

    <div v-if="loading&&item==null">
      <v-skeleton-loader
          width="450"
          class="mt-4"
          type="table-row-divider@5"
      ></v-skeleton-loader>
    </div>

    <v-form v-if="!loading||item!=null" ref="form" v-model="valid">
      <div subheader v-if="!passwordView">
        <v-subheader>User data</v-subheader>
        <v-row class="ma-1">
          <v-col
              cols="12"
              sm="6"
              md="4"
              v-for="(field) in headersNotHidden" :key="field.position+field.name"
          >
            <component :snapshot="snapshot"
                       v-model="item[field.name]"
                       :field="field"
                       :api="api"
                       :options="viewOptions(field)"
                       :is="getFieldComponent(field)"></component>
          </v-col>
        </v-row>
      </div>
      <v-divider></v-divider>

      <div subheader v-if="passwordView">
        <v-subheader v-if="user.State==='PWCHANGE'">Please change your temporary password!</v-subheader>
        <v-row class="ma-1">
          <v-col
              cols="6"
              sm="6"
              md="4"
          >
            <v-text-field type="password" label="Old password" :rules="pwRules('oldpw',item['OldPassword'])"
                          v-model="item['OldPassword']"></v-text-field>
          </v-col>
        </v-row>
        <v-row class="ma-1">
          <v-col
              cols="6"
              sm="6"
              md="4"
          >
            <v-text-field type="password" label="New password" :rules="pwRules('',item['Password'])"
                          v-model="item['Password']"></v-text-field>
          </v-col>
        </v-row>
        <v-row class="ma-1">
          <v-col
              cols="6"
              sm="6"
              md="4"
          >
            <v-text-field type="password"  label="Reenter new password" :rules="pwRules('reenter',item['RePassword'])"
                          v-model="item['RePassword']"></v-text-field>
          </v-col>
        </v-row>
      </div>
    </v-form>
  </v-card>
</template>
