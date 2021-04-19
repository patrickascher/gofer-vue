<script>
import {
  VAppBar,
  VAppBarNavIcon,
  VBtn,
  VContainer,
  VDivider,
  VIcon,
  VLayout,
  VList,
  VListItem,
  VListItemAvatar,
  VListItemContent,
  VListItemSubtitle,
  VListItemTitle,
  VMain,
  VMenu,
  VSpacer,
  VToolbarTitle
} from 'vuetify/lib'
import _ from 'lodash'
import {userService} from '../services/user'
import {ALERT, USER} from '../store/modules/types'
import {store} from '../store'
import {i18nService} from '../services/i18n'
import Navigation from '@/lib-components/layout/dash/Navigation'
import Config from '../services/config'


export default {
  data() {
    return {
      title: Config.get('webserver.app.name'),
      logo: Config.get('webserver.app.logoSmall'),
      navMini: false,
      userMenu: false,
      languages: {},
    }
  },
  created() {
    this.user = store.getters['user/' + USER.GET_DATA]
    store.watch(state => state.languages.availableLangs, () => {
      this.languages = store.state.languages.availableLangs
    });

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
  components: {
    Navigation,
    VAppBar,
    VAppBarNavIcon,
    VIcon,
    VToolbarTitle,
    VSpacer,
    VMenu,
    VList,
    VListItem,
    VListItemAvatar,
    VBtn,
    VContainer,
    VMain,
    VLayout,
    VListItemContent,
    VListItemTitle,
    VListItemSubtitle,
    VDivider
  },
  methods: {
    changeLang(lang) {
      i18nService.loadLanguageAsync(lang, false)
    },
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
          :close-on-click="true"
          :close-on-content-click="true"
          :offset-y="true"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-btn
              dark
              icon
              v-bind="attrs"
              v-on="on"
          >
            <v-icon>mdi-translate</v-icon>
            <v-icon x-small style="width:12px;margin-top:10px;">mdi-chevron-down</v-icon>
          </v-btn>
        </template>

        <v-list dense>
          <v-list-item
              @click="changeLang(item.BCP)"
              v-for="item in languages"
              :key="item.ID"
          >
            <v-list-item-title>{{ item.SelfName }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

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
