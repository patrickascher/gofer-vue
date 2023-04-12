<script>
import {
  VChip,
  VIcon,
  VListGroup,
  VListItem,
  VListItemIcon,
  VListItemSubtitle,
  VListItemTitle,
  VTooltip,
    VAvatar,
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
    VListGroup, VListItem, VListItemTitle, VIcon, VTooltip, VListItemSubtitle, VChip, VListItemIcon,VAvatar
  },
  methods: {
    mouseEnter: function () {
      if (_.get(this, '$el.children', false) !== false) {
        this.showTooltip = this.$el.children[1].offsetWidth < this.$el.children[1].scrollWidth
      }
    },
    createTranslatedNames: function () {
        this.node["translated"] = this.$t(this.node.Title)
    },
  },
  created: function () {
    this.createTranslatedNames()
  },
  computed: {

    isActive() {
      let checkRecursive = (node) => {
        if (node.Route.Pattern === this.$route.path) {
          return true;
        }

        if (node.Children && node.Children.length) {
          for (let i = 0; i < node.Children.length; i++) {
            let child = node.Children[i];

            if (child.Route.Pattern !== "" && typeof child.Route.Pattern!=="undefined" && this.$route.path.length>=child.Route.Pattern.length && this.$route.path.startsWith(child.Route.Pattern)) {
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
      return checkRecursive(this.node);
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
      <v-list-item @click.native.stop v-if="node.Route.Pattern" :to="node.Route.Pattern"></v-list-item>
      <v-list-item-title>
        {{ node.Title }}
      </v-list-item-title>
    </template>

    <nav-node v-for="item in node.Children" :key="item.Id" :depth="depth<=0?1:depth+1" :node="item"></nav-node>
  </v-list-group>

  <v-list-item
      :value="isActive"
      :prepend-icon="depth<1?node.Icon:null"
      :to="node.Route.Pattern"
      :class="'navpoint-depth-'+depth"
      v-else>
    <v-list-item-icon v-if="depth<1">
      <v-icon v-text="node.Icon"></v-icon>
    </v-list-item-icon>

    <v-tooltip right :disabled="!node.Note">
      <template v-slot:activator="{ on }">
        <v-list-item-title v-on="on">{{ node.Title  }}</v-list-item-title>
      </template>
      <span>{{$t(this.node.Note)}}</span>
    </v-tooltip>

    <v-list-item-icon v-if="node.Icon&&depth>=1">
      <v-icon v-text="node.Icon"></v-icon>
    </v-list-item-icon>
  </v-list-item>


</template>

<style>
.navpoint-depth-2{
  padding-left:4rem !important;
  background-color: whitesmoke;
}
.v-list-group--sub-group{
  padding-left:0.5rem;
}
</style>
