<script>

import {
  VAppBar,
  VAvatar,
  VBtn,
  VCard,
  VCardText,
  VCardTitle,
  VChip,
  VIcon,
  VTimeline,
  VTimelineItem,
  VToolbarTitle,
  VTooltip
} from 'vuetify/lib'
import {http} from "@/lib-components/services/http";
import {dateService} from "@/lib-components/services/date";
import {store} from "@/lib-components/store";
import {ALERT} from "@/lib-components/store/modules/types";

export default {
  props: {
    config: Object,
    api: String,
  },
  components: {
    VAvatar,
    VTooltip,
    VCard,
    VCardTitle,
    VCardText,
    VAppBar,
    VToolbarTitle,
    VBtn,
    VIcon,
    VTimeline,
    VTimelineItem,
    VChip
  },
  mounted() {
    this.getData()
  },
  methods: {
    date(date) {
      return dateService.UTCToLocal(date)
    },
    userAvatar(id) {
      return this.users[id].Name.charAt(0) + this.users[id].Surname.charAt(0);
    },
    randomRobot() {
      const robots = ["mdi-robot-outline",
        "mdi-robot-angry-outline",
        "mdi-robot-confused-outline",
        "mdi-robot-dead-outline",
        "mdi-robot-excited-outline",
        "mdi-robot-happy-outline",
        "mdi-robot-love-outline"];
      const random = Math.floor(Math.random() * robots.length);
      return robots[random];
    },
    userName(id) {
      if (id === '0' || id === 0) {
        return "System";
      }
      return this.users[id].Name + " " + this.users[id].Surname;
    },
    historyText(value) {
      try {
        let rv = ""
        let _this = this
        _.forEach(JSON.parse(value), function (val) {
          let field = _this.historyTextTitle(val.Field)
          let newValue = val.New
          let oldValue = val.Old
          let childs = val.Children

          // normal fields
          if (typeof childs === 'undefined') {
            if (typeof oldValue === 'undefined') {
              rv += _this.$t('HISTORY.CreateEntry', {
                Field: field,
                NewValue: _this.historyTextValue(newValue)
              }) + "<br/>"
            } else if (typeof newValue === 'undefined') {
              rv += _this.$t('HISTORY.DeleteEntry', {
                Field: field,
                OldValue: _this.historyTextValue(oldValue, "deleted")
              }) + "<br/>"
            } else {
              rv += _this.$t('HISTORY.UpdateEntry', {
                Field: field,
                NewValue: _this.historyTextValue(newValue),
                OldValue: _this.historyTextValue(oldValue)
              }) + "<br/>"
            }
          } else {
            rv += field + "<br/>";
            let index = null
            _.forEach(childs, function (child) {
              field = _this.historyTextTitle(child.Field)
              let newValue = child.New
              let oldValue = child.Old

              if (index == null) {
                index = child.Index
                if (typeof index !== "undefined") {
                  rv += "(" + index + ") "
                }
              }

              if (typeof oldValue === 'undefined') {
                rv += _this.$t('HISTORY.CreateEntry', {
                  Field: field,
                  NewValue: _this.historyTextValue(newValue)
                })
              } else if (typeof newValue === 'undefined') {
                rv += _this.$t('HISTORY.DeleteEntry', {
                  Field: field,
                  OldValue: _this.historyTextValue(oldValue, "deleted")
                })
              } else {
                rv += _this.$t('HISTORY.UpdateEntry', {
                  Field: field,
                  NewValue: _this.historyTextValue(newValue),
                  OldValue: _this.historyTextValue(oldValue)
                })
              }

              if (index !== child.Index) {
                index = child.Index
                rv += "<br/>"
                if (typeof index !== "undefined") {
                  rv += "(" + index + ") "
                }
              }
            });

          }

        });
        return rv
      } catch (e) {
        // normal text
        return value;
      }
    },
    historyTextTitle(title) {
      return "<b>" + title + ":</b>"
    },
    historyTextValue(val, v) {
      if (v === "deleted") {
        return "<span style=\"text-decoration: line-through\">" + val + "</span>"
      }
      return "<span style=\"text-decoration: underline\">" + val + "</span>"
    },
    getData() {
      this.loading = true;
      http.get(this.api.replace("mode/update", "mode/history")).then((resp) => {

        let _this = this
        _.forEach(resp.data.users, function (user) {
          if (user.ID !== 0) {
            _this.users[user.ID] = user
          }
        });
        this.history = resp.data.history

        this.loading = false;
      }).catch((error) => {
        this.loading = false;
        store.commit('alert/' + ALERT.ERROR, error);
      });
    },
  },
  computed: {
    show: {
      get() {
        return this.value
      },
      set(value) {
        this.$emit('input', value)
      }
    },
    changed: function () {
    },
  },
  data() {
    return {
      loading: false,

      history: {},
      users: [],
    }
  }
}
</script>

<template>
  <v-card>

    <v-app-bar fixed color="primary" dark>
      <v-btn icon dark @click="show = false">
        <v-icon>mdi-close</v-icon>
      </v-btn>
      <v-toolbar-title>{{ $t('HISTORY.Title') }}</v-toolbar-title>
    </v-app-bar>

    <v-timeline class="px-4 mt-15">
      <v-timeline-item
          v-for="h in history"
          :key="h.ID"
          fill-dot
      >
        <template v-slot:icon>
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-avatar v-on="on">
                <v-icon dark v-if="h.UserID==='0'">
                  {{ randomRobot() }}
                </v-icon>
                <span v-if="h.UserID!=='0'" class="white--text">{{ userAvatar(h.UserID) }}</span>
              </v-avatar>
            </template>
            <span>{{ userName(h.UserID) }}</span>
          </v-tooltip>
        </template>
        <template v-slot:opposite>
          <span>{{ date(h.CreatedAt) }}</span>
        </template>
        <v-card class="elevation-2">
          <!--<v-card-title class="headline">{{ h.Type }}</v-card-title>-->
          <v-card-text v-html="historyText(h.Value)"></v-card-text>
        </v-card>
      </v-timeline-item>


      <v-timeline-item
          v-if="history===null"
          fill-dot
      >
        <template v-slot:icon>
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-avatar v-on="on">
                <v-icon dark>
                  {{ randomRobot() }}
                </v-icon>
              </v-avatar>
            </template>
            <span>{{ userName(0) }}</span>
          </v-tooltip>
        </template>
        <template v-slot:opposite>
          <span></span>
        </template>
        <v-card class="elevation-2">
          <v-card-title class="headline">{{ $t('HISTORY.NoDataTitle') }}</v-card-title>
          <v-card-text> {{ $t('HISTORY.NoDataText') }}</v-card-text>
        </v-card>
      </v-timeline-item>

  </v-card>
</template>
