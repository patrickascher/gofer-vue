<script>
import {VCard, VList, VListItem, VListItemTitle, VNavigationDrawer, VSkeletonLoader} from 'vuetify/lib'
import NavNode from "@/lib-components/layout/dash/NavigationNode"
import {userService} from "@/lib-components/services/user"
import {ALERT, LANGUAGES, NAVIGATION} from "@/lib-components/store/modules/types";
import {store} from "@/lib-components/store";

export default {
  data() {
    return {
      loading: true,
      hrefPrivacy:this.$t('CONTROLLER.auth.Controller.Login.PrivacyHREF'),
      hrefImpress:this.$t('CONTROLLER.auth.Controller.Login.ImpressHREF'),
      items: {},
      drawer: true,
    }
  },
  props: ["mini"],
  components: {
    NavNode,
    VCard, VNavigationDrawer, VList, VSkeletonLoader, VListItem, VListItemTitle
  },
  computed: {
    sorted: {
      get: function () {
        return this.items ? _.sortBy(this.items, ["Position", "translated"]) : [];
      },
      set: function (newValue) {
        this.items = newValue
      }
    },
    navMini: {
      get: function () {
        return this.mini;
      },
      // setter - should not set the value on mouse over
      set: function (newValue) {
      }
    }
  },
  methods: {
    sortedT: function(item){
      return item ? _.sortBy(item, ["Position", "translated"]) : [];
    },
    createTranslatedNames: function () {
      let _this = this
      this.items.forEach((head, index) => {
        _this.items[index]["translated"] = _this.$t(head.Title)
        if(_this.items[index]["Children"]!==null){
          _this.items[index]["Children"].forEach((chead, cindex) => {
            _this.items[index]["Children"][cindex]["translated"] = _this.$t(chead.Title)
          });
        }
        _this.items[index]["Children"] = _this.sortedT(_this.items[index]["Children"])
      });
    },
  },
  created: function () {
    userService.navigation().then((resp) => {
      if (typeof resp !== "undefined") {
        this.sorted = resp.data.navigation;
        store.commit("languages/" + LANGUAGES.SET_LANGUAGES, resp.data.languages);
        this.createTranslatedNames()
      }
      this.loading = false;
    }).catch((error) => {
        store.commit('alert/' + ALERT.ERROR, error);
    });

    store.watch(state => state.navigation.reload, () => {
      if (store.state.navigation.reload === true) {
        userService.navigation().then((resp) => {
          if (typeof resp !== "undefined") {
            this.sorted = resp.data.navigation;
            this.createTranslatedNames()
          }
          this.loading = false;
        }).catch((error) => {
          store.commit('alert/' + ALERT.ERROR, error);
        });
        store.commit('navigation/' + NAVIGATION.CLEAR)
      }
    });
  }
}

</script>

<template>
  <v-card>
    <v-navigation-drawer
        color="grey lighten-3"
        v-model="drawer"
        :mini-variant.sync="navMini"
        :expand-on-hover="navMini"
        clipped
        permanent
        app
    >
      <v-list dense>
        <nav-node v-for="item in sorted" :key="item.Id" :depth="0" :node="item"></nav-node>
      </v-list>
      <v-skeleton-loader
          v-if="loading"
          type="list-item-avatar@3"
      ></v-skeleton-loader>
      <template v-slot:append>

        <v-list-item v-if="!navMini&&hrefPrivacy!==' '" dense target="_blank" :href="hrefPrivacy">
          <v-list-item-title>Privacy poilicy<br/>
          </v-list-item-title>
        </v-list-item>
        <v-list-item v-if="!navMini&&hrefImpress!==' '" dense target="_blank" :href="hrefImpress">
          <v-list-item-title>Impressum</v-list-item-title>
        </v-list-item>

      </template>
    </v-navigation-drawer>
  </v-card>
</template>

<style>
.v-skeleton-loader__list-item-avatar {
  background: none !important;
}
</style>
