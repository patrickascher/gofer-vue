<script>
import {
  VChip,
  VIcon,
  VListGroup,
  VListItem,
  VListItemIcon,
  VListItemSubtitle,
  VListItemTitle,
  VTooltip
} from 'vuetify/lib'

export default {
  name: "NavNode",
  data() {
    return {
      showTooltip: false
    }
  },
  props: {
    node: Object,
    depth: Number
  },
  components: {
    VListGroup, VListItem, VListItemTitle, VIcon, VTooltip, VListItemSubtitle, VChip, VListItemIcon
  },
  methods: {
    mouseEnter: function () {
      if (_.get(this, '$el.children', false) !== false) {
        this.showTooltip = this.$el.children[1].offsetWidth < this.$el.children[1].scrollWidth
      }
    }
  },
  computed: {

    isActive() {
      let checkRecursive = () => {

        if (this.node.Route.Pattern === this.$route.path) {
          //this.groupActive = true; //TODO needed?
          return true;
        }

        if (this.node.Children && this.node.Children.length) {
          for (let i = 0; i < this.node.Children.length; i++) {
            let child = this.node.Children[i];

            if (child.Route.Pattern !== "" && this.$route.path.startsWith(child.Route.Pattern)) {
              return true;
            }
            if (child.Children && child.Children.length) {
              if (checkRecursive(child)) {
                return true
              }
            }
          }

        }

        return false
      };

      return checkRecursive();
    }
  }
}
</script>

<template>

  <v-list-group
      v-if="node.Children!=null && node.Children.length>0"
      :prepend-icon="depth<1?node.Icon:null"
      :no-action="depth<1"
      :sub-group="depth>=1"
      :value="isActive"
  >

    <template v-slot:activator>
      <v-list-item-title>
        {{ $t("NAVIGATION."+node.Title) }}
      </v-list-item-title>
    </template>

    <nav-node v-for="item in node.Children" :key="item.Id" :depth="depth<=0?1:depth+1" :node="item"></nav-node>
  </v-list-group>
  <v-list-item
      :value="isActive"
      :prepend-icon="depth<1?node.Icon:null"
      :to="node.Route.Pattern"
      v-else>
    <v-list-item-icon v-if="depth<1">
      <v-icon v-text="node.Icon"></v-icon>
    </v-list-item-icon>

    <v-tooltip right :disabled="!showTooltip">
      <template v-slot:activator="{ on }">
        <v-list-item-subtitle v-if="node.Note">
          <v-chip x-small>{{ node.Note }}</v-chip>
        </v-list-item-subtitle>
        <v-list-item-title @mouseover="mouseEnter()" v-on="on">{{ $t("NAVIGATION."+node.Title)  }}</v-list-item-title>
      </template>
      <span> {{ $t("NAVIGATION."+node.Title)  }}</span>
    </v-tooltip>

    <v-list-item-icon v-if="node.Icon&&depth>=1">
      <v-icon v-text="node.Icon"></v-icon>
    </v-list-item-icon>
  </v-list-item>

</template>

<style>
</style>
