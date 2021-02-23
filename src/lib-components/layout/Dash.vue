<script>
import {VAppBar,VAppBarNavIcon,VIcon,VToolbarTitle,VSpacer,VMenu,VList,VListItem,VListItemAvatar,VBtn,VContainer,VMain,VLayout,VListItemContent,VListItemTitle,VListItemSubtitle,VDivider} from 'vuetify/lib'
import _ from 'lodash'
import {userService} from '../services/user'
import {ALERT, USER} from '../store/modules/types'
import {store} from '../store'

import Navigation from '@/lib-components/layout/dash/Navigation'


export default {
  data() {
    return {
      title: process.env.VUE_APP_TITLE,
      logo: process.env.VUE_APP_DASH_LOGO,
      navMini: false,
      userMenu: false,
    }
  },
  created() {
    this.user = store.getters['user/' + USER.GET_DATA]
    if (_.has(this.user, ['State']) && this.user.State === "PWCHANGE") {
      // TODO show PW CHANGE FORM
    }
  },
  computed: {
    roles() {
      if (this.user !== null && this.user.Roles.join(", ").length > 0) {
        return this.user.Roles.join(", ");
      }
      return "";
    }
  },
  components: {Navigation,
    VAppBar,VAppBarNavIcon,VIcon,VToolbarTitle,VSpacer,VMenu,VList,VListItem,VListItemAvatar,VBtn,VContainer,VMain,VLayout,VListItemContent,VListItemTitle,VListItemSubtitle,VDivider},
  methods: {
    updateMenu(variable) {
      this.userMenu = variable
    },
    logout: function () {
      userService.logout().then(() => {
        userService.redirectLogin()
      }).catch((error) => {
        store.commit('alert/' + ALERT.ERROR, error);
        userService.redirectLogin()
      })
    }
  }
}
</script>

<template>
  <div>

    <navigation :mini="navMini"></navigation>
    <v-app-bar
        app
        color="primary"
        clipped-left
        dark
    >
      <v-app-bar-nav-icon @click.stop="navMini = !navMini">
        <v-icon v-if="!navMini">mdi-menu-open</v-icon>
      </v-app-bar-nav-icon>

      <img :src="require('@/assets/'+logo)" width="40">
      <v-toolbar-title class="mr-12 align-center">
        <span class="title">{{ title }}</span>
      </v-toolbar-title>

      <v-spacer></v-spacer>
      <v-menu
          v-if="user!==null&&user.Name!==''"
          v-model="userMenu"
          :close-on-click="true"
          :close-on-content-click="true"
          :offset-y="true"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon v-bind="attrs"
                 v-on="on">
            <v-icon>mdi-account</v-icon>
            <v-icon x-small style="width:12px;margin-top:10px;">mdi-chevron-down</v-icon>

          </v-btn>
        </template>
        <v-list dense style="width:280px;">
          <v-list-item>
            <v-list-item-avatar>
              <v-icon large>mdi-account</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>{{ user.Name }} {{ user.Surname }}</v-list-item-title>
              <v-list-item-subtitle>{{ user.Email }}</v-list-item-subtitle>
              <v-list-item-subtitle>{{ roles }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item to="/logout">
            <v-list-item-title>Logout</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>


    </v-app-bar>


    <v-main>
      <v-container fill-height>
        <v-layout>
          <router-view :key="$route.path"></router-view>
        </v-layout>
      </v-container>
    </v-main>
  </div>
</template>
