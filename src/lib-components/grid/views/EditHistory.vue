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
import {i18nService} from "@/lib-components/services/i18n";
export function HistoryToString(value){
  try {
    let rv = ""
    _.forEach(JSON.parse(value), function (val) {
      let field = historyTextTitle(val.Field)
      let newValue = val.New
      let oldValue = val.Old
      let childs = val.Children

      // normal fields
      if (typeof childs === 'undefined') {
        if (typeof oldValue === 'undefined' || oldValue===null) {
          rv += i18nService.i18n.t('HISTORY.CreateEntry', {
            Field: field,
            NewValue: historyTextValue(newValue)
          }) + "<br/>"
        } else if (typeof newValue === 'undefined') {
          rv += i18nService.i18n.t('HISTORY.DeleteEntry', {
            Field: field,
            OldValue: historyTextValue(oldValue, "deleted")
          }) + "<br/>"
        } else {


          rv += i18nService.i18n.t('HISTORY.UpdateEntry', {
            Field: field,
            NewValue: historyTextValue(newValue),
            OldValue: historyTextValue(oldValue)
          }) + "<br/>"
        }
      } else {
        rv += "<h4>"+field + "</h4>";
        let index = null
        let rvChild=[]
        _.forEach(childs, function (child) {
          field = historyTextTitle(child.Field)
          let newValue = child.New
          let oldValue = child.Old

          let _rv =""
          if (typeof child.Index!=="undefined"){
            _rv += "(" + (child.Index+1) + ") "

          }

          if (typeof oldValue === 'undefined' || oldValue===null) {
            _rv += i18nService.i18n.t('HISTORY.CreateEntry', {
              Field: field,
              NewValue: historyTextValue(newValue)
            })
          } else if (typeof newValue === 'undefined') {
            _rv += i18nService.i18n.t('HISTORY.DeleteEntry', {
              Field: field,
              OldValue: historyTextValue(oldValue, "deleted")
            })
          } else {
            _rv += i18nService.i18n.t('HISTORY.UpdateEntry', {
              Field: field,
              NewValue: historyTextValue(newValue),
              OldValue: historyTextValue(oldValue)
            })
          }

          rvChild.push(_rv)
        });

        rv += rvChild.join("<br/>")
      }

    });
    return rv
  } catch (e) {
    console.log(e)
    // normal text
    return value;
  }
}

function historyTextTitle(title) {
  return "<b>" + title + ":</b>"
}
function historyTextValue(val, v) {
  if (v === "deleted") {
    return "<span style=\"text-decoration: line-through\">" + i18nService.i18n.t(val) + "</span>"
  }
  return "<span style=\"text-decoration: underline\">" + i18nService.i18n.t(val) + "</span>"
}


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
     return HistoryToString(value)
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
