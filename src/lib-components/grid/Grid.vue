<script>
import {MODE_CREATE, MODE_TABLE, MODE_UPDATE} from '@/lib-components/grid/common'
// views
import GridTableView from '@/lib-components/grid/views/Table'
import GridEditView from '@/lib-components/grid/views/Edit'

/**
 * default export of the grid component
 *
 * components: default components are defined here.
 * There is a view for the table an edit/new view. Both components
 * get the api property. Which component is loaded depends on the grid mode.
 * It's also possible to define an own global component.
 *
 * methods:
 * getComponent is returning the right component name depending on the grid mode.
 * apiUrl is returning the api url depending on the route definition.
 */
export default {
  data() {
    return {
      currentRoute: {}
    }
  },
  components: {
    GridTableView,
    GridEditView
  },
  created() {
    this.currentRoute = this.$router.history.current
  },
  computed: {
    getComponent() {
      let mode =this.mode()
      if (_.get(this.currentRoute, "meta.grid.view"+mode[0].toUpperCase() + mode.substring(1), false) !== false) {
        return this.currentRoute.meta.grid["view"+mode[0].toUpperCase() + mode.substring(1)]
      }
      if (this.mode() === MODE_TABLE) {
        return "grid-table-view";
      } else {
        return "grid-edit-view";
      }
    }
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
    apiUrl: function () {
      let api = "";

      if (_.get(this.currentRoute, "meta.api", false) === false) {
        api = "/api" + this.currentRoute.path;
      } else {
        api = this.currentRoute.meta.api;
        //if (mode() !== MODE_TABLE) {
        if (typeof this.currentRoute.params.pathMatch !== "undefined") {
          api = api.replace(/\/$/, "");
          api += "/" + this.currentRoute.params.pathMatch
        }

      }
      return api.replace(/\/$/, "");
    },
  }
}

</script>

<template>
  <component :api="apiUrl()" :is="getComponent"></component>
</template>

<style>
</style>
